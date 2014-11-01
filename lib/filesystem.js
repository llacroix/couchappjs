var fs = require("fs");


function walkDirectory(path, ignore) {
  if (!fs.existsSync(path))
    return [];

  paths = fs.readdirSync(path);

  files = paths.map(function (path2) {
    var completePath = path + "/" + path2

    if (ignore && ignore(path2, completePath)) {
      return null;
    } else if(fs.statSync(completePath).isDirectory()) {
      return walkDirectory(completePath, ignore);
    } else {
      return completePath;
    }
  }).reduce(function (accum, val) {
    if (Object.prototype.toString.call(val) === '[object Array]') {
      accum = accum.concat(val)
    } else if (val) {
      accum.push(val);
    }
    return accum;
  }, [])

  return files;
}

module.exports = {
  walk: walkDirectory
}
