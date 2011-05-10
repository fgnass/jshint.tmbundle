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

function html(s) {
  return (s || '').replace(/[&"<>]/g, function(c) {return entities[c] || c;});
}

/**
 * Downloads the latest JSHint version from jshint.com and invokes the callback when done.
 */
function download(ready) {
  var req = http.get({host: 'jshint.com', port: 80, path: '/jshint.js'}, function(res) {
    if (res.statusCode == 200) {
      res.setEncoding('utf8');
      var data = '';
      res.on('data', function(chunk) {
        data += chunk;
      });
      res.on('end', function() {
        fs.writeFile(jshintPath, data, ready);
      });
    }
    else {
      ready('Download of jshint.js failed. HTTP status code: ' + res.statusCode);
    }
  }).on('error', function(err) {
    ready('Download of jshint.js failed: ' + html(err.message));
  });
}

/**
 * Updates the local copy of jshint.js (if it is older than one day) and
 * invokes the given callback, passing the JSHINT object. 
 */
function autoupdate(callback) {
  var fileExists;
  function done(err) {
    callback(err, (!err || fileExists) && require(jshintPath).JSHINT);
  }
  fs.stat(jshintPath, function(err, stats) {
    fileExists = !err;
    if (err || (Date.now() - Date.parse(stats.mtime)) / 1000 / 60 / 60 / 24 >= 1) {
      return download(done);
    }
    done();
  });
}

module.exports = function(options) {
  autoupdate(function(err, jshint) {
    var body = '';
    if (err) {
      body += '<div class="error">' + err + '</div>';
    }
    if (jshint) {

      var file = env.TM_FILEPATH;
      var input = fs.readFileSync(file, 'utf8');

      //remove shebang
      input = input.replace(/^\#\!.*/, '');

      if (!jshint(input, options)) {
        jshint.errors.forEach(function(e) {
          if (e) {
            var link = 'txmt://open?url=file://' + escape(file) + '&line=' + e.line + '&column=' + e.character;
            body += ('<a class="txmt" href="' + link + '">' + e.reason);
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
      }
    }
    if (body.length > 0) {
      fs.readFile(__dirname + '/output.html', 'utf8', function(e, html) {
        sys.puts(html.replace('{body}', body));
        process.exit(205); //show_html
      });
    }
  });
};
