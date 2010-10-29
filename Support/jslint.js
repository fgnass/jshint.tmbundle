var sys = require("sys"),
	fs = require("fs"),
	Script = process.binding('evals').Script,
	file = process.ENV.TM_FILEPATH;

var input = fs.readFileSync(file, 'utf8');

//remove shebang
input = input.replace(/^\#\!.*/, "");

Script.runInThisContext(fs.readFileSync(__dirname + '/fulljslint.js', 'utf8'));

var success = JSLINT(input, {
	predef: [
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
});

if (!success) {
	var body = '';
	JSLINT.errors.forEach(function(e) {
		body += ('<a href="txmt://open?url=file://' + escape(file) + '&line=' + e.line + '&column=' + e.character + '">' + e.reason);
		if (e.evidence) {
			//TODO highlight column
			body += '<pre>' + (e.evidence || '') + '</pre></a>';
		}
	});
	fs.readFile(__dirname + '/output.html', 'utf8', function(e, html) {
		sys.puts(html.replace('{body}', body));
		process.exit(205); //show_html
	});
}
