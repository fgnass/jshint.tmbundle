#JSHint TextMate Bundle

TextMate bundle for [JSHint](http://jshint.com/), the (Gentler) JavaScript Code Quality Tool.

![Screenshot](https://github.com/downloads/fgnass/fgnass.github.com/jslint.png)

Features:

* Pretty UI
* Runs automatically upon save (⌘S)
* Can be bypassed by pressing ⇧⌘S
* JSHint can be run by itself by pressing ^⇧L
* Output is only shown when errors are found
* Window is automatically closed when it looses focus
* Window with error list is closed when all errors are fixed and saved or checked again
* Uses custom JSHint options if `.jshintrc` found in current dir, TextMate project, or User Home
* Auto-updates itself to the latest version of JSHint
* Based on Node.js

## Installation

Download the [zip file](http://github.com/fgnass/jshint.tmbundle/zipball/master) and rename the
extracted folder to `jshint.tmbundle`. Double-click.

## Prerequisites

You need [Node.js](http://nodejs.org/) and TextMate, that's all.

This bundle uses `#!/bin/env node` to launch the node process. If you get a *node - not found* error, the `PATH` variable is probably not setup properly in TextMate (this happens when you start TextMate via the Finder rather than from the command-line). Either add or extend the PATH variable in TextMate preferences to include path to node binary.

You can set the PATH either via Preferences → Variables or by editing `~/.MacOSX/environment.plist`.

Example: When installed with [homebrew](http://brew.sh/), path to node is `/usr/local/bin/node`. If jshint.tmbundle can't find executable node add `/usr/local/bin` to existing TextMate PATH:

    PATH    $PATH:/usr/local/bin

## TODO

Consider including/updating a local copy of latest stable JSHint installed using node/npm instead of automatically downloading source files directly from JSHint repo.

## Contributors

* [Pierre Bertet](https://github.com/bpierre/)
* [Rob-ot](https://github.com/Rob-ot/)
* [Stephen Bannasch](https://github.com/stepheneb/)
