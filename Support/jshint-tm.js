var sys = require("sys"),
  fs = require("fs"),
  env = process.env || process.ENV,
  JSHINT = require('./jshint.js').JSHINT;

module.exports = function (options) {
  var file = env.TM_FILEPATH,
    input = fs.readFileSync(file, 'utf8'),
    body = '';

  //remove shebang
  input = input.replace(/^\#\!.*/, "");

  if (!JSHINT(input, options)) {
    JSHINT.errors.forEach(function(e) {
      if (e) {
        body += ('<a href="txmt://open?url=file://' + escape(file) + '&line=' + e.line + '&column=' + e.character + '">' + e.reason);
        if (e.evidence && !isNaN(e.character)) {
          body += '<tt>';
          body += e.evidence.substring(0, e.character-1);
          body += '<em>';
          body += (e.character <= e.evidence.length) ? e.evidence.substring(e.character-1, e.character) : '&nbsp;';
          body += '</em>';
          body += e.evidence.substring(e.character);
          body += '</tt>';
        }
        body += '</a>';
      }
    });
    fs.readFile(__dirname + '/output.html', 'utf8', function(e, html) {
      sys.puts(html.replace('{body}', body));
      process.exit(205); //show_html
    });
  }
};
