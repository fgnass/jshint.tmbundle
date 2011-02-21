var sys = require("sys"),
	fs = require("fs"),
	env = process.env || process.ENV,
	file = env.TM_FILEPATH,
	JSHINT = require(__dirname + '/fulljshint.js').JSHINT;

var input = fs.readFileSync(file, 'utf8');

//remove shebang
input = input.replace(/^\#\!.*/, "");

function repeat (str, num) {
  return new Array(num + 1).join(str);
}

module.exports = function (options) {
    var success = JSHINT(input, options);

    if (!success) {
        var body = '';
        JSHINT.errors.forEach(function(e) {
            if (e) {
                body += ('<a href="txmt://open?url=file://' + escape(file) + '&line=' + e.line + '&column=' + e.character + '">' + e.reason);
                if (e.evidence) {
                    //TODO highlight column
                    body += '<pre>' + (e.evidence || '') + '</pre>';
                    if (e.character) {
                        body += '<pre>' + repeat(' ', e.character - 1) + '^</pre>';
                    }
                    body += '</a>';
                }
            }
        });
        fs.readFile(__dirname + '/output.html', 'utf8', function(e, html) {
            sys.puts(html.replace('{body}', body));
            process.exit(205); //show_html
        });
    }
};
