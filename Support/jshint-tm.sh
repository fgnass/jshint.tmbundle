#!/bin/bash

init_script=$1

# Read current file, escape slashes, escape quotes, add trailing slashes (except on last line)
input_file=$(cat "$TM_FILEPATH" | sed -e 's/\\/\\\\/g' | sed -e "s/'/\\\'/g" | tr -d '\r' | sed -e '$q;s/$/\\n\\/g')
set_input_file="var jshint_input='${input_file}';"

# Read template file, escape quotes, add trailing slashes (except on last line)
output_tpl=$(cat "$TM_BUNDLE_SUPPORT/output.html" | sed -e "s/'/\\\'/g" | sed -e '$q;s/$/\\n\\/g')
set_output_tpl="var output_tpl='${output_tpl}';"

# JSHint
jshint_script=$(cat "${TM_BUNDLE_SUPPORT}/jshint.js")

# Init function
init_function=$(cat <<EOF
  function tmJSHINT(options) {
    
    //remove shebang
    jshint_input = jshint_input.replace(/^\#\!.*/, "");
    
    if (!JSHINT(jshint_input, options)) {
      var body = '';
      JSHINT.errors.forEach(function(e) {
        if (e) {
          body += ('<a href="txmt://open?url=file://' + escape("${TM_FILEPATH}") + '&line=' + e.line + '&column=' + e.character + '">' + e.reason);
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
      print(output_tpl.replace('{body}', body));
    }
  }
EOF
)

# Launch the script with JavaScriptCore interpreter
result=$(/System/Library/Frameworks/JavaScriptCore.framework/Versions/A/Resources/jsc -e "$set_input_file$set_output_tpl$jshint_script$init_function$init_script")

# Display result
if [[ $result != "" ]]; then
  echo $result
  # exit 205 == exit_show_html
  exit 205
fi