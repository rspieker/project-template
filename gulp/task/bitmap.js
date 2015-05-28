'use strict';

module.exports = function(stream, devour) {
	return stream
		//  write the raw file to the destination
		.pipe(devour.write())

		//  minify the bitmap
		.pipe(devour.plugin('imagemin'))

		//  rename the extension to '.min.svg'
		.pipe(devour.plugin('rename', devour.min))

		//  write the stream
		.pipe(devour.write())

		//  damage report
		.pipe(devour.pipe('size'))
	;
};
