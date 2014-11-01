var utils = require("../util")

function loadFilters(obj) {
  obj.views = utils.loadViews(process.cwd() + "/views", utils.ignoreDefault)
}

module.exports = function (registry) {
  registry.filters.add("views", [], loadFilters)
}
