var utils = require("../util")

function loadFilters(obj) {
  obj.filters = utils.loadScripts(process.cwd() + "/filters", utils.ignoreDefault)
}

module.exports = function (registry) {
  registry.filters.add("filters", [], loadFilters)
}
