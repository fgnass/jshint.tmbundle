var fs = require('fs');
var env = process.env || process.ENV;

module.exports = function() {
  var default_options = {
      "forin": true,
      "predef": [
          // CommonJS
          "exports",
          "require",
          "module",
          // NodeJS
          "GLOBAL",
          "process",
          "__filename",
          "__dirname"
      ]
  };

  var current_dir = env.TM_DIRECTORY;
  var project_dir = env.TM_PROJECT_DIRECTORY;
  var home_dir = env.HOME;
  var options;

  function readCustomOptions(path) {
    if (fs.existsSync(path)) {
      return JSON.parse(fs.readFileSync(path, 'utf8'));
    } else {
      return false;
    }
  }

  if (current_dir) {
    options = readCustomOptions(current_dir + '/.jshintrc');
    if (options) return options;
  }

  if (project_dir) {
    options = readCustomOptions(project_dir + '/.jshintrc');
    if (options) return options;
  }

  if (home_dir) {
    options = readCustomOptions(home_dir + '/.jshintrc');
    if (options) return options;
  }

  return default_options;
};
