var utils = require("../util")
var fs = require('fs')

function loadRewrite() {
  
  if (fs.existsSync(process.cwd() + "/rewrites.js")) {
    return require(process.cwd() + "/rewrites.js")
  } else if (fs.existsSync(process.cwd() + "/rewrites.json")) {
    return require(process.cwd() + "/rewrites.json")
  }

  return null
}

function loadFilters(obj) {
  var rewrites = loadRewrite()
  if (rewrites) {
    obj.rewrites = rewrites
  }
}

module.exports = function (registry) {
  registry.filters.add("rewrites", [], loadFilters)
}
