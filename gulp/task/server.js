'use strict';

var spawn = require('child_process').spawn,
	gutil = require('gulp-util'),
	node;

module.exports = function(stream, devour, name) {
	if (node) {
		node.kill();
		gutil.log('Stopped ' + gutil.colors.yellow(name));
	}

	node = spawn('node', ['index.js'], {stdio: 'inherit'});
	node.on('close', function(code) {
		var error;

		if (code === 8) {
			error = new gutil.PluginError(name, 'Error detected, waiting for changes');
		}
	});

	gutil.log('Started ' + gutil.colors.green(name));
};
