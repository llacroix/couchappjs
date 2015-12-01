var bower = require("bower")
  , mime  = require("mime")
  , path  = require("path")
  , Promise = require("promise")
  , fs    = require("fs")


function load(registry, callback) {
  bower
    .commands
    .list(null, {cwd: process.cwd() + "/attachments"})
    .on("end", function(result) {
      var deps = Object.keys(result.dependencies)
            .map(function (name) {
              var canon = result.dependencies[name].canonicalDir
                , main = result.dependencies[name].pkgMeta.main
                , source = result.dependencies[name].endpoint.source

              // Check if main is an array 
              // A package in bower can have multiple main files
              if (Object.prototype.toString.call(main) === '[object Array]') {
                files = main
              } else {
                files = [main]
              }

              return files.map(function (file) {
                var filename = file.replace("./", "")
                  , sourceName = "bower_components/" + source + "/" + filename
                  , canonName = canon + "/" + filename

                return {
                  name: sourceName
                , data: fs.readFileSync(canonName).toString("base64")
                , content_type: mime.lookup(canonName)
                }
              })
            })

      callback(deps)
    })
}


function loadFilters(registry) {
  return function (obj) {
    if (!registry.config.useBower) {
      return null
    }

    console.log("Syncing bower")

    return promise = new Promise(function (success, failure) {
      try {
        load(registry, success)
      } catch (err) {
        failure(err)
      }
    }).then(function (results) {
      if (results.length > 0 && obj._attachments == undefined) {
        obj._attachments = {}
      }

      // Load all results in the _attachments. 
      results.forEach(function (main) {
        main.forEach(function(val) {
          obj._attachments[val.name] = {
            content_type: val.content_type
          , data: val.data
          }
        })
      })
    }).catch(function (e) {
      console.log(e)
    })

  }
}

module.exports = function (registry) {
  registry.filters.add("bower", ["attachments"], loadFilters(registry))
}
