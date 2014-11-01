var utils = require("../util")

function loadFilters(obj) {
  obj.shows = utils.loadScripts(process.cwd() + "/shows", utils.ignoreDefault)
}

module.exports = function (registry) {
  registry.filters.add("shows", [], loadFilters)
}
