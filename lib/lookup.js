var fs   = require("fs")
var path = require("path")

function ignoreDottedFiles (file) {
  return file[0] !== "."
}

function makeMap(par) {
  return function mapPackages(file) {
    return JSON.parse(fs.readFileSync(par + "/" + file + "/" + "package.json").toString())
  }
}

function filterPlugins(mod) {
  return mod.keywords && mod.keywords.indexOf("couchappjs-plugin") !== -1
}

function lookup(dir) { 
  var files 

  try {
    files = fs.readdirSync(dir)
  } catch (err) {
    files = []
  }

  files = files.filter(ignoreDottedFiles)
               .map(makeMap(dir))
               .filter(filterPlugins)
               .map(function (mod) {
                 return require(mod.name)
               })

  return files
}

module.exports = lookup
