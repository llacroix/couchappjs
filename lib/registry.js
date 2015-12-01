var Filters = require("./filters")
  , nano = require("nano")
  , mime = require("mime")
  , fs = require("fs")

var lookup = require("./lookup")

function Registry() {
  this.config = this.getConfig("couchapp")
  this.commands = {}
  this.filters = new Filters()

  this.design = {
    _id: "_design/" + this.config.name
  }
}

Registry.prototype.getConfig = function (filename) {
  var mod

  if (filename[0] !== "/") {
    filename = process.cwd() + "/" + filename
  }

  try {
    mod = require(filename)
  } catch(err) {
    mod = {}   
  }

  return mod
}

Registry.prototype.registerPlugin = function (plugin) {
  plugin(this)
}

Registry.prototype.registerCommand = function (name, command) {
  this.commands[name] = command
}

Registry.prototype.execute = function (commandName, yargs) {
  if (this.commands[commandName]) {
    return this.commands[commandName](yargs)
  }

  return false
}

Registry.prototype.getDesign = function () {
  return this.design 
}

Registry.prototype.lookupPlugins = function () {
  var self = this
    , modules = lookup(process.cwd()  + "/node_modules")

  modules.forEach(function (mod) {
    self.registerPlugin(mod)
  })
}

Registry.prototype.loadFilters = function () {
  // Load default set of filters
  this.registerPlugin(require("./filters/attachments"))
  this.registerPlugin(require("./filters/views"))
  this.registerPlugin(require("./filters/shows"))
  this.registerPlugin(require("./filters/updates"))
  this.registerPlugin(require("./filters/lists"))
  this.registerPlugin(require("./filters/filters"))
  this.registerPlugin(require("./filters/packages"))
  this.registerPlugin(require("./filters/bower"))
  this.registerPlugin(require("./filters/rewrites.js"))
}

Registry.prototype.push = function (obj, target) {
  target = target || 'dev'

  var host = this.config.targets[target]
  var couch = nano(host.hostname)
  var username = host.user
  var password = host.password

  function push_design(db) {
    //var db = couch.use(host.database)
    console.log("Pushing to: " + host.hostname + "/" + host.database)

    this.design = obj

    function push_attachments(data, attachment) {
      db.attachment.insert(obj._id,
        attachment.name, attachment.data, attachment.mime,
        {rev: data.rev},
        function (err, data) {
          if (!err) {
            console.log(("Uploaded : " + attachment.name).green)

            if (attachment.next) {
              push_attachments(data, attachment.next)
            } else {
              console.log("Finished uploading attachments".green)
            }
          } else {
            console.log("Error inserting attachment".red)
            console.log(err)
          }
        })
    }


    function push_design(data, cb) {
      obj._rev = data._rev

      db.insert(obj, function (err, doc, ls){
        if (err) {
          console.log(obj)
          console.log(err.toString().red)
        } else {
          console.log("Update completed".green)
          cb(doc)
        }
      })

    }

    function make_attachment(attachments) {
      if (attachments.length == 0) {
        return null
      }

      return {
        name: attachments[0]
      , data: fs.readFileSync(process.cwd() + "/attachments/" + attachments[0], 'binary')
      , mime: mime.lookup(attachments[0])
      , next: make_attachment(attachments.slice(1))
      }
    }

    var attachment = make_attachment(Object.keys(obj._attachments))

    delete obj._attachments

    db.get(obj._id, function (err, data) {
      //push_attachments(data, attachment, push_design)
      push_design(data, function (data2) {
        push_attachments(data2, attachment)
      })
    })
  }

  if (username) {
    couch.auth(username, password, function (err, body, headers) {
      if (err) {
        console.log(err)
      } else {
        var couch = nano({
          url : host.hostname,
          cookie: headers['set-cookie'][0]
        })
        push_design(couch.use(host.database))
      }
    })
  } else {
    push_design(couch.use(host.database))
  }

}

module.exports = Registry
