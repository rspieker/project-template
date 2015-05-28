'use strict';

function exclude(file) {
	return /\be?x(?:cl(?:ude)?)?\b/.test(file.path);
}

module.exports = function(stream, devour, excluded, included) {
	return stream
		//  files matching the exclusion will flow into the `excluded` flow, everything else goes into the `included` flow
		.pipe(devour.plugin('if', exclude, excluded, included))
	;
};
