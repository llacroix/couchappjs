#!/usr/bin/env node

var yargs = require('yargs')
  , argv = yargs
      .usage("Usage: $0")

      .argv

  , couchapp = require("../index.js")

// Load command line scripts
couchapp.lookupPlugins()
couchapp.registerPlugin(require("../lib/cmd/init"))
couchapp.registerPlugin(require("../lib/cmd/sync"))

if (!couchapp.execute(argv._[0], yargs)) {
  yargs.showHelp()
}
