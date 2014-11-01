var chokidar = require('chokidar');
var path = require("path")
var colors = require("colors")

function makeSync(registry) {
  return function(yargs) {
    yargs = yargs
    .usage("Usage: couchapp sync [--pretend]")
    .alias("p", "pretend")
    .default("p", false)
    .describe("p", "Pretend to sync and print the result to the output")
    .alias("w", "watch")
    .default("w", false)
    .describe("w", "Watch directory for changes and reupload attachments or update doc")

    var argv = yargs.argv

    registry.loadFilters()

    function pushObjects(obj) {
      if (argv.pretend) {
        console.log("Pretend pushing...")
        console.log(JSON.stringify(obj, null, 4).green)
      } else {
        console.log("Pushing to couchdb...")
        registry.push(obj)
      }
    }

    function buildDesign() {
      console.log("Building couchapp...")
      var obj = registry.getDesign()
      registry.filters.apply(obj)
              .done(pushObjects)
    }

    function ignore(filePath, stats) {
      var filename = path.basename(filePath)
      if (filePath.indexOf('node_modules') >= 0)
        return true
      if (filename[0] === '.')
        return true
    }

    if (!argv.watch) {
      buildDesign()
    } else {
      var watcher = chokidar.watch(process.cwd(), {ignored: ignore, persistent: true, ignoreInitial: true})

      watcher
        .on('add', buildDesign)
        .on('addDir', buildDesign)
        .on('change', buildDesign)
        .on('unlink', buildDesign)
        .on('unlinkDir', buildDesign)
        .on('error', function(error) {console.error('Error happened', error);})
    }

    return true;
  }
}

module.exports = function (registry) {
  registry.registerCommand("sync", makeSync(registry))
}
