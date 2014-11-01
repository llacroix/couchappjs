var Promise = require("promise")

function initPromise(obj) {
  return new Promise(function (success, error) {
    success(obj)
  })
}

function makeFilter (command) {
  return function (obj) {
    return new Promise(function (success, fail) {
      var result = command(obj)

      if (result && result.then && result.done) {
        result.done(function (value) {
          success(obj)
        })
      } else {
        if (command) {
          success(obj)
        } else {
          fail(obj)
        }
      }
    })
  }
}

function Filters() {
  this.filters = []
}

Filters.prototype.add = function (name, deps, command) {
  console.log("Adding filter [" + name + "]")

  this.filters.push({
    name: name
  , dependencies: deps
  , func: makeFilter(command)
  })
}

Filters.prototype.apply = function (obj) {
  continuation = initPromise(obj)
  
  this.filters.forEach(function (filter) {
    continuation = continuation.then(function (obj) {
      return filter.func(obj)
    })
  })

  return continuation
}

module.exports = Filters
