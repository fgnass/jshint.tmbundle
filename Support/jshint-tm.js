var fs = require('fs');
var https = require('https');
var env = process.env || process.ENV;
var jshintPath = __dirname + '/jshint.js';
var jshintPackagePath = __dirname + '/package.json';
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var child;
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
 * Downloads the latest JSHint version from GitHub and invokes the callback when done.
 * https://raw.github.com/jshint/jshint/master/src/jshint.js
 */
function download_jshint_resources(ready) {
  var req,
      resources = ["jshint.js", "vars.js", "messages.js", "lex.js", "reg.js", "state.js", "style.js"];

  resources.forEach(function(resource) {
    req = https.get({host: 'raw.github.com', port: 443, path: '/jshint/jshint/master/src/' + resource}, function(res) {
      if (res.statusCode === 200) {
        res.setEncoding('utf8');
        var data = '';
        res.on('data', function(chunk) {
          data += chunk;
        });
        res.on('end', function() {
          fs.writeFile(__dirname + '/' + resource, data, ready);
        });
      }
      else {
        ready('Download of ' + resource + ' failed. HTTP status code: ' + res.statusCode);
      }
    }).on('error', function(err) {
      ready('Download of ' + resource + ' failed: ' + html(err.message));
    });
  });
}

/**
 * Downloads the latest package.json for JSHint from GitHub and invokes the callback when done.
 * https://raw.github.com/jshint/jshint/master/package.json
 */
function download_jshint_package_json(ready) {
  var req = https.get({host: 'raw.github.com', port: 443, path: '/jshint/jshint/master/package.json'}, function(res) {
    if (res.statusCode === 200) {
      res.setEncoding('utf8');
      var data = '';
      res.on('data', function(chunk) {
        data += chunk;
      });
      res.on('end', function() {
        fs.writeFile(jshintPackagePath, data, ready);
      });
    }
    else {
      ready('Download of package.json for jshint.js failed. HTTP status code: ' + res.statusCode);
    }
  }).on('error', function(err) {
    ready('Download of package.json for jshint.js failed: ' + html(err.message));
  });
}

/**
 * Runs npm install --production for JSHint in Support dir and invokes the callback when done.
 * https://raw.github.com/jshint/jshint/master/src/jshint.js
 */
function run_npm_install_for_jshint(ready) {
  var install = exec('npm install --production',
    { encoding: 'utf8', cwd: __dirname },
    function (error, stdout, stderr) {
    if (error) {
      ready('npm install of production dependencies for jshint.js failed: ' + stderr);
    } else {
      ready();
    }
  }).on('error', function(err) {
    ready('Download of package.json for jshint.js failed: ' + html(err.message));
  });
}

function download(callback) {
  function done(err) {
    callback(err);
  }
  download_jshint_resources(function (err) {
    if (err) {
      done(err);
    } else {
      download_jshint_package_json(function (err) {
        if (err) {
          done(err);
        } else {
          run_npm_install_for_jshint(done);
        }
      });
    }
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
  // Download jshint.js and update production npm module dependencies
  fs.stat(jshintPath, function(err, stats) {
    fileExists = !err;
    if (err || (Date.now() - Date.parse(stats.mtime)) / 1000 / 60 / 60 / 24 >= 1) {
      return download(done);
    }
    done();
  });
}

function closeWindowWithTitle(title) {
  spawn('osascript',  ['close-window.applescript', title], { cwd: __dirname });
}

module.exports = function(options) {
  autoupdate(function(err, jshint) {
    var file = env.TM_FILEPATH;
    var savedFile = fs.readFileSync(file, 'utf8');
    var title = "JSHint: " + env.TM_FILENAME;
    var input = "";
    var currentDocument = "";
    var readableStdin = fs.createReadStream('/dev/stdin', { encoding: 'utf8', autoClose: true });
    readableStdin.on('data', function(chunk) {
      currentDocument += chunk;
    });

    var body = '';
    if (err) {
      body += '<div class="error">' + err + '</div>';
    }
    if (jshint) {

      readableStdin.on('end', function() {
        if (currentDocument.length > 0) {
          input = currentDocument;
        } else {
          input = savedFile;
        }

        //remove shebang
        input = input.replace(/^\#\!.*/, '');

        if (!jshint(input, options)) {
          jshint.errors.forEach(function(e, i) {
            if (e) {
              var link = 'txmt://open?url=file://' + escape(file) + '&line=' + e.line + '&column=' + e.character;
              body += ('<a class="txmt" href="' + link + '" id="e' + (i+1) + '">');
              if (i < 9) {
                body += '<b>'+(i+1)+'</b>';
              }
              body += e.reason;
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
        if (body.length > 0) {
          fs.readFile(__dirname + '/output.html', 'utf8', function(e, html) {
            html = html.replace('{body}', body);
            html = html.replace('<title>jshint</title>', "<title>" + title + "</title>");
            console.log(html);
            process.exit(205); //show_html
          });
        } else {
          closeWindowWithTitle(title);
        }
      });
    }
  });
};
