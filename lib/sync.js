var nano = require("nano");
var fs = require("fs");
var mime = require("mime");
var loader = require("./bower_load")
var ph = require("path")
var walk = require("./filesystem").walk

var config = {
  name: "test2"
, server: "http://loic:loic@localhost:5984"
, database: "enotes"
}

function mapScript (file) {
  return {
    name: ph.basename(file).replace(".js",""),
    data: require(file).toString()
  }
}

function reduceScript (accum, val) {
  accum[val.name] = val.data;
  return accum;
}

function loadRewrite() {
  
  if (fs.existsSync("./rewrites.js")) {
    return require("./rewrites.js")
  } else if (fs.existsSync("./rewrites.json")) {
    return require("./rewrites.json")
  }

  return {}
}


function mapFile(path) {
  return {
    path: path,
    data: fs.readFileSync(path).toString("base64"),
    content_type: mime.lookup(path)
  }
}

function replacePath(what, by) {
  return function (file) {
    file.path = file.path.replace(what, by)
    return file
  }
}

function reduceFiles(accum, file) {
  accum[file.path] = {
    content_type: file.content_type,
    data: file.data
  }
  return accum;
}

function loadDirectory(directory) {
  return walk(directory)
          .map(mapFile)
          .map(replacePath(directory, ""))
          .reduce(reduceFiles, {})
}

function loadScripts(directory) {
  return walk(directory).map(mapScript).reduce(reduceScript, {})
}

function isEmpty(obj) {
  return Object.keys(obj).length === 0
}

function addAttribute(obj, key, value) {
  if (!isEmpty(value)) {
    obj[key] = value
  }
}

function sync(config) {
  var couch = nano(config.server)
  var db = couch.use(config.database)

  var obj = {
    _id: '_design/' + config.name
  }

  rewrites = loadRewrite()
  lists   = loadScripts("./lists")
  shows   = loadScripts("./shows")
  updates = loadScripts("./updates")
  attachments = loadDirectory("./attachments")

  addAttribute(obj, '_attachments', attachments)
  addAttribute(obj, 'shows', shows)
  addAttribute(obj, 'lists', lists)
  addAttribute(obj, 'rewrites', rewrites)
  addAttribute(obj, 'updates', updates)

  loader(function (results) {
    if (results.length > 0 && obj._attachments == undefined)
      obj._attachments = {}

    results.forEach(function (main) {
      main.forEach(function(val) {
        obj._attachments[val[0]] = {
          content_type: val[2]
        , data: val[1]
        }
      })
    })

    db.get(obj._id, function (err, doc, ls) {
      if (doc) 
        obj._rev = doc._rev

      db.insert(obj, function (err, doc, ls){
        if (err) {
          console.log(err)
        }
      })
    })
  })
}
