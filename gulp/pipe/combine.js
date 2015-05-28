'use strict';

module.exports = function(stream, devour, type, inject) {
	var dest = 'public/' + type,
		ext  = type === 'script' ? 'js' : 'css',
		minifier = type === 'script' ? 'uglify' : 'minify-css';

	stream = stream
		//  put the files in the proper order before concatenation
		.pipe(devour.pipe('order'))

		//  combine the file into a single file containing all (included) sources
		.pipe(devour.plugin('concat', dest + '/combined.' + ext))

		//  write the plain combined file
		.pipe(devour.write())
	;

	if (inject) {
		stream = stream.pipe(inject);
	}

	return stream
		.pipe(devour.pipe('minify', minifier))
	;
};
