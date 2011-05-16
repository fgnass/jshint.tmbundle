var sys = require("sys"),
  fs = require("fs"),
  env = process.env || process.ENV,
  JSHINT = require('./jshint.js').JSHINT,
  warningMsgs = require('./warning-msgs.js'),
  entities = {
    '&': '&amp;',
    '"': '&quot;',
    '<': '&lt;',
    '>': '&gt;'
  };

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
	
	if(/\.js$/i.test(file) === false) return;

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
