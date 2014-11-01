var utils = require("../util")
var walk  = require("../filesystem").walk
var fs    = require("fs")

function loadFilters(obj) {
  //obj.commonjs = utils.loadCommonJS(process.cwd() + "/commonjs", utils.ignoreDefault)
  files = walk(process.cwd() + "/commonjs", utils.ignoreDefault)

  files = files.map(function (file) { return {
      source: file,
      path: file.replace(process.cwd() + "/", "").split("/")
    }
  })

  reduced = files.reduce(function (accum, file) {
    var current = accum

    file.path.forEach(function (loc, id, lst) {
      if (id === lst.length - 1) {
        current[loc.replace(".js", "")] = fs.readFileSync(file.source).toString()
      } else {
        if (current[loc]) {
          current = current[loc]
        } else {
          current = current[loc] = {}
        }
      }
    })

    return accum
  }, {})

  obj.commonjs = reduced.commonjs
}

module.exports = function (registry) {
  registry.filters.add("commonjs", [], loadFilters)
}
