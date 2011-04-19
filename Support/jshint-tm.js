var sys = require('sys');
var fs = require('fs');
var http = require('http');
var env = process.env || process.ENV;
var jshintPath = __dirname + '/jshint.js';
var entities = {
  '&': '&amp;',
  '"': '&quot;',
  '<': '&lt;',
  '>': '&gt;'
};

/**
 * Downloads the latest JSHint version from jshint.com and invokes the callback when done.
 */
function download(ready) {
  try {
    var req = http.get({host: 'jshint.com', port: 80, path: '/jshint.js'}, function(res) {
      if (res.statusCode == 200) {
        res.setEncoding('utf8');
        var file = fs.createWriteStream(jshintPath);
        res.on('data', function(chunk) {
          file.write(chunk);
        });
        res.on('end', function() {
          file.end();
          ready();
        });
      }
      else {
        ready();
      }
    });
  }
  catch(err) {
    ready();
  }
}

/**
 * Updates the local copy of jshint.js (if it is older than one day) and
 * invokes the given callback, passing the JSHINT object. 
 */
function autoupdate(callback) {
  function done() {
    callback(require(jshintPath).JSHINT);
  }
  fs.stat(jshintPath, function(err, stats) {
    if (err || (Date.now() - Date.parse(stats.mtime)) / 1000 / 60 / 60 / 24 >= 1) {
      return download(done);
    }
    done();
  });
}

function html(s) {
  return (s || '').replace(/[&"<>]/g, function(c) {return entities[c] || c;});
}

module.exports = function(options) {
  autoupdate(function(jshint) {
    var file = env.TM_FILEPATH,
      input = fs.readFileSync(file, 'utf8'),
      body = '';

    //remove shebang
    input = input.replace(/^\#\!.*/, '');

    if (!jshint(input, options)) {
      jshint.errors.forEach(function(e) {
        if (e) {
          body += ('<a href="txmt://open?url=file://' + escape(file) + '&line=' + e.line + '&column=' + e.character + '">' + e.reason);
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
  });
};
