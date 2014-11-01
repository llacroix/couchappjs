var Filters = require("./filters")
  , nano = require("nano")

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
}

Registry.prototype.push = function (obj, target) {
  target = target || 'dev'
  var host = this.config.targets[target]
  var couch = nano(host.hostname)
  var db = couch.use(host.database)

  console.log("Pushing to: " + host.hostname + "/" + host.database)
  this.design = obj

  db.get(obj._id, function (err, doc, ls) {
    if (doc)
      obj._rev = doc._rev

    db.insert(obj, function (err, doc, ls){
      if (err) {
        console.log(obj)
        console.log(err.toString().red)
      } else {
        console.log("Update completed".green)
      }
    })
  })
}

module.exports = Registry
