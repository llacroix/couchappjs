var Promise = require('promise')
var fs = require("fs")

module.exports = {
  stat: Promise.denodeify(fs.stat)
, readdir: Promise.denodeify(fs.readdir)
, readFile: Promise.denodeify(fs.readFile)
}

