var utils = require("../util")



module.exports = function (registry) {
  function ignoreBower(file) {
    console.log(file)
    if (registry.config.useBower && (file == 'bower_components' || file == 'bower.json')) {
      return true
    }
    return false
  }

  function loadFilters(obj) {
    obj._attachments = utils.loadDirectory(process.cwd() + "/attachments", ignoreBower)
  }

  registry.filters.add("attachments", [], loadFilters)
}
