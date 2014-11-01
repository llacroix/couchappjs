var bower = require("bower")
  , mime  = require("mime")
  , path  = require("path")
  , fs    = require("fs")


module.exports = function (callback) {
  bower
    .commands
    .list()
    .on("end", function(result) {
      var deps = Object.keys(result.dependencies)
            .map(function (name) {
              var canon = result.dependencies[name].canonicalDir
                , main = result.dependencies[name].pkgMeta.main
                , source = result.dependencies[name].endpoint.source

              if (Object.prototype.toString.call(main) === '[object Array]') {
                files = main
              } else {
                files = [main]
              }

              return files.map(function (file) {
                var filename = file.replace("./", "")

                return [
                         "bower_components/" + source + "/" + filename
                       , fs.readFileSync(canon + "/" + filename).toString("base64")
                       , mime.lookup(canon + "/" + filename)
                       ]
              })
            })

      callback(deps)
    })
}
