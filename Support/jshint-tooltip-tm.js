var sys = require("sys"),
  fs = require("fs"),
  env = process.env || process.ENV,
  JSHINT = require('./jshint.js').JSHINT,
  entities = {
    '&': '&amp;',
    '"': '&quot;',
    '<': '&lt;',
    '>': '&gt;'
  };

// Messages we would like to consider as warnings (feel free to change these)
var warningMsgs = [
	'Missing semicolon.', 
	'Mixed spaces and tabs.',
	'The body of a for in should be wrapped in an if statement to filter unwanted properties from the prototype',
	'is better written in dot notation'
];

function inArray(item, arry) {
	for(var key in arry){
		if(~item.indexOf(arry[key])){
			return true;
		}
	}
	return false;
}

function html(s) {
  return (s || '').replace(/[&"<>]/g, function(c) {return entities[c] || c;});
}

module.exports = function (options) {
  var file = env.TM_FILEPATH,
    input = fs.readFileSync(file, 'utf8'),
    output = '',
	errors = 0,
	warnings = 0,
	append = '';

  //remove shebang
  input = input.replace(/^\#\!.*/, '');

  if (!JSHINT(input, options)) {
    JSHINT.errors.forEach(function(e) {
		if (e) {
			if(inArray(e.reason, warningMsgs)){
				warnings++;
			} else if (~e.reason.indexOf('Stopping, unable to continue.')) {
				append += e.reason;
			} else {
				errors++;
			}
		}
    });
    if (warnings || errors) {
		output = 'Errors: '+ errors + '\nWarnings: ' + warnings;
		if(append){
			output += '\n' + append;
		}
		sys.puts(output);
    }
  }
};
