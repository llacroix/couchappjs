var nano = require("nano");
var fs = require("fs");
var mime = require("mime");
var loader = require("./bower_load")
var ph = require("path")
var walk = require("./filesystem").walk
var colors = require("colors")

function ignoreDefault(path) {
  return path[0] === '.' || path === 'node_modules'
}

function mapScript (file) {
  var data = null
  try {
    delete require.cache[file]
    data = require(file).toString()
  } catch (err) {
    console.log(err.toString().red)
  }

  return {
    source: file,
    name: ph.basename(file).replace(".js",""),
    data: data
  }
}

function reduceScript (accum, val) {
  console.log(val.source)

  if (val.data) {
    if (accum[val.name]) {
      console.log(("Warning: " + val.name +
                   " is being overriden by " + val.source).yellow)
    }
    accum[val.name] = val.data;
  }
  return accum;
}

function mapView (file) {
  var data = null
    , script = null
  try {
    delete require.cache[file]
    script = require(file) 

    if (script.map) {
      data = {map: script.map.toString()}

      if (script.reduce) {
        data.reduce = script.reduce.toString()
      }
    }
  } catch(err) {
    console.log(err.toString().red)
  }

  return {
    source: file,
    name: ph.basename(file).replace(".js",""),
    data: data
  }
}

function loadRewrite() {
  if (fs.existsSync(process.cwd() + "/rewrites.js")) {
    delete require.cache[process.cwd() + "/rewrites.js"]
    return require(process.cwd() + "/rewrites.js")
  } else if (fs.existsSync(process.cwd() + "/rewrites.json")) {
    delete require.cache[process.cwd() + "/rewrites.json"]
    return require(process.cwd() + "/rewrites.json")
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

function loadDirectory(directory, ignore) {
  return walk(directory, ignore)
          .map(mapFile)
          .map(replacePath(directory + "/", ""))
          .reduce(reduceFiles, {})
}

function loadViews(directory, ignore) {
  return walk(directory, ignore).map(mapView).reduce(reduceScript, {})
}

function loadScripts(directory, ignore) {
  return walk(directory, ignore).map(mapScript).reduce(reduceScript, {})
}

function isEmpty(obj) {
  return Object.keys(obj).length === 0
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

module.exports = {
  loadScripts: loadScripts
, loadViews: loadViews
, loadDirectory: loadDirectory
, ignoreDefault: ignoreDefault
} 
