var Promise = require("promise")
var fs = require("./fs")

function walk(dir) {
  return fs.readdir(dir).then(function (files) {
    return Promise.all(files.map(function (file) {
      return fs.stat(dir + "/" + file).then(function (stat) {
        if (stat.isDirectory()) {
          return walk(dir + "/" + file)
        } else {
          return dir + "/" + file
        }
      })
    }))
  })
  .then(function (res) {
    return res.reduce(function (accum, val) {
      if (Object.prototype.toString.call(val) === '[object Array]') {
        accum = accum.concat(val)
      } else {
        accum.push(val);
      }
      return accum;
    }, [])
  })
}
