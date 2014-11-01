#!/usr/bin/env node

var yargs = require('yargs')
  , argv = yargs
      .usage("Usage: $0")

      .argv

  , couchapp = require("../index.js")

couchapp.registerPlugin(require("../lib/cmd/init"))
couchapp.registerPlugin(require("../lib/cmd/sync"))

if(!couchapp.execute(argv._[0], yargs))
  yargs.showHelp()

/*
function addCommand(commands, commandName) {
  commands[commandName] = require("../lib/cmd/" + commandName)
}

function runCommand(commands) {
  var commandName = argv._[0]

  if (commands[commandName]) {
    commands[commandName](yargs)
  } else {
    yargs.showHelp()
  }
}

addCommand(commands, "sync")
addCommand(commands, "init")

runCommand(commands)
*/
