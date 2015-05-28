'use strict';

module.exports = function(stream, devour, name) {
	return stream
		//  write the raw file to the destination
		.pipe(devour.write())

		//  minify the svg
		.pipe(devour.plugin('svgmin'))

		//  rename the extension to '.min.svg'
		.pipe(devour.plugin('rename', devour.min))

		//  write the stream
		.pipe(devour.write())

		//  rasterize the vector into a png file, optimize it
		.pipe(devour.plugin('raster'))
		.pipe(devour.plugin('imagemin'))
		//  rename the file to '<basename>.png'
		.pipe(devour.plugin('rename', function(file) {
			file.extname = '.png';
		}))
		//  write the stream
		.pipe(devour.write())

		//  damage report
		.pipe(devour.pipe('size'))
	;
};
