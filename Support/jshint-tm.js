var sys = require("util"),
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
    body = '',
	lineClass = '';
	
	if(/\.js$/i.test(file) === false) return;

  //remove shebang
  input = input.replace(/^\#\!.*/, '');

  if (!JSHINT(input, options)) {
    JSHINT.errors.forEach(function(e) {
      if (e) {
		lineClass = inArray(e.reason, warningMsgs) ? 'warning' : 'error';
        body += ('<a class="'+ lineClass +'" href="txmt://open?url=file://' + escape(file) + '&line=' + e.line + '&column=' + e.character + '">' + e.reason);
		body += '<tt class="line"> Line ' + e.line + ' Char ' + e.character + '</tt>';
        if (e.evidence && !isNaN(e.character)) {
          body += '<tt>';
          body += html(e.evidence.substring(0, e.character-1));
          body += '<em>';
          body += (e.character <= e.evidence.length) ? html(e.evidence.substring(e.character-1, e.character)) : '&nbsp;';
          body += '</em>';
          body += html(e.evidence.substring(e.character));
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
