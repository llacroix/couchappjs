var utils = require("../util")

function loadFilters(obj) {
  obj.updates = utils.loadScripts(process.cwd() + "/updates", utils.ignoreDefault)
}

module.exports = function (registry) {
  registry.filters.add("updates", [], loadFilters)
}
