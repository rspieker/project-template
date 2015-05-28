'use strict';

module.exports = function(stream, devour, name) {
	return stream
		//  write the raw file to the destination
		//.pipe(devour.write())

		//  process the markdown into html
		.pipe(devour.plugin('markdown'))

		//  rename into lowercase
		.pipe(devour.plugin('rename', function(file) {
			file.basename = file.basename.toLowerCase();
		}))

		//  minify the html sources
		.pipe(devour.plugin('minify-html'))

		//  write the stream
		.pipe(devour.write())

		//  damage report
		.pipe(devour.pipe('size'))
	;
};
