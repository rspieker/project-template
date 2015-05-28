'use strict';

module.exports = function(stream, devour, name) {
	return stream
		//  write the raw file to the destination
		//.pipe(devour.write())

		//  minify the html sources
		.pipe(devour.plugin('minify-html'))
		.pipe(devour.plugin('minify-inline-scripts'))

		//  handle all configured replacements
		.pipe(devour.pipe('replace', name))

		//  write the stream
		.pipe(devour.write())

		//  damage report
		.pipe(devour.pipe('size'))
	;
};
