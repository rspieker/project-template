'use strict';

module.exports = function(stream, devour) {
	return stream
		//  run the stream through myth(.io) to resolve variables, apply CSS functions (calc, color, etc) and add prefixed versions
		.pipe(devour.plugin('myth'))

		//  add the '.prep.css' as extension
		.pipe(devour.plugin('rename', function(file) {
			file.extname = '.prep' + file.extname;
		}))

		//  write the stream
		.pipe(devour.write())
	;
};
