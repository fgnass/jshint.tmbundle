module.exports = function() {
  var options = {
      "es5": true,
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
    
    return options;
}