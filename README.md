#JSHint TextMate Bundle

TextMate bundle for [JSHint](http://jshint.com/), the (Gentler) JavaScript Code Quality Tool.

This version provides a tool tip on save instead of spawning a new window containing errors. This interrupts your workflow less.

![Screenshot - Validation screen](//dl.dropbox.com/u/3972536/Github%20Images/validationPopup.png)

![Screenshot - Tooltip on save](//dl.dropbox.com/u/3972536/Github%20Images/toolTip.png)

Features:

* Pretty UI
* Highlights critical errors
* Runs tooltip automatically upon save (⌘S)
* Validation screen opens on ⇧⌘V
* Can be bypassed by pressing ⇧⌘S
* Output is only shown when errors are found
* Window is automatically closed when it looses focus
* Based on Node.js

## Installation

Download the [zip file](https://github.com/MrNibbles/jshint.tmbundle/zipball/master) and rename the
extracted folder to `jshint.tmbundle`. Double-click.

## Prerequisites

You need [Node.js](http://nodejs.org/) and TextMate, that's all.

If you don't have Node.js installed on your system you can also use [Pierre Bertet's fork](https://github.com/bpierre/jshint.tmbundle) which uses [WebKit's JavaScriptCore](http://trac.webkit.org/wiki/JSC) instead.

This bundle uses `#!/bin/env node` to launch the node process. If you get a *node - not found* error,the `PATH` variable is probably not setup in TextMate (this happens when you start TextMate via the Finder rather than from the command-line).

You can set the PATH either via Preferences → Advanced → Shell Variables or by editing `~/.MacOSX/environment.plist`.

## Contributors

* [Pierre Bertet](https://github.com/bpierre/)
* [Rob-ot](https://github.com/Rob-ot/)
* [Anthony Mann](https://github.com/MrNibbles/)
