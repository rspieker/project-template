'use strict';

module.exports = function(stream, devour) {
	return stream
		//  write the raw file to the destination
		.pipe(devour.write())
	;
};
