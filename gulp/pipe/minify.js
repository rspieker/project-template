'use strict';

module.exports = function(stream, devour, minifier) {
	return stream
		//  initialize the sourcemap
		.pipe(devour.plugin('sourcemaps').init())

		//  uglify the file
		.pipe(devour.plugin(minifier))

		//  add the '.min.css' as extension
		.pipe(devour.plugin('rename', devour.min))

		//  write the sourcemap
		.pipe(devour.plugin('sourcemaps').write('./', {sourceRoot: './'}))
	;
};
