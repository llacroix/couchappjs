var prompt = require('prompt');
var colors = require('colors')
var fs = require("fs")

function makeDirs(source, targets) {
  targets.forEach(function (target) {
    fs.mkdirSync(source + "/" + target)
  })
}

function initCommand(yargs) {
  var schema = [
    {
      name: 'name'
    , description: 'Couchapp name:'
    , type: 'string'
    , required: true
    }
  , {
      name: 'description'
    , description: 'Description:'
    , type: 'string'
    }
  , {
      name: 'host'
    , description: 'Server hostname:'
    , default: "http://localhost:5984"
    , type: 'string'
    }
  , {
      name: 'database'
    , description: 'Database:'
    , type: 'string'
    , required: true
    }
  , {
      name: 'useBower'
    , description: 'Use bower to load dependencies'
    , type: 'boolean'
    , default: false
    }
  ]

  prompt.message = ''
  prompt.delimiter = ''
  prompt.start()

  prompt.get(schema, function (err, result) {
    var obj = {
      name: result.name
    , description: result.description
    , useBower: result.useBower
    , targets: {
        dev: {
          hostname: result.host 
        , database: result.database + "-dev"
        }
      , prod: {
          hostname: result.host
        , database: result.database
        }
      }
    }

    console.log('Preview: couchapp.json'.green)
    console.log(JSON.stringify(obj, null, 2).green)
    console.log(("Initializing project into: " + process.cwd() + "/" + obj.name).green)

    try {
      fs.mkdirSync(obj.name)
      fs.writeFileSync(obj.name + "/couchapp.json", JSON.stringify(obj, null, 2))
      makeDirs(obj.name, ["views", "attachments", "updates", "shows", "lists", "filters", "commonjs"])
    } catch(err) {
      console.log("Cannot initialize project, directory already exists".red)
    } 
  })

  return true
}

module.exports = function (registry) {
  registry.registerCommand("init", initCommand)
}
