'use strict';

module.exports = function(stream, devour, name) {
	return stream
		//  write the raw file to the destination
		//.pipe(devour.write())

		//  split the stream to exclude files from concatenation and skip directly to minification
		//  files which are not explicitly excluded are always concatenated (in order) and minified
		.pipe(devour.pipe('exclude', devour.pipe('minify', 'uglify'), devour.pipe('combine', name)))

		//  handle all configured replacements
		.pipe(devour.pipe('replace', name))

		//  write the stream
		.pipe(devour.write())

		//  damage report
		.pipe(devour.pipe('size'))
	;
};
