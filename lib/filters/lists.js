var utils = require("../util")

function loadFilters(obj) {
  obj.lists = utils.loadScripts(process.cwd() + "/lists", utils.ignoreDefault)
}

module.exports = function (registry) {
  registry.filters.add("lists", [], loadFilters)
}
