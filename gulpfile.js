'use strict';

var Wanted = require('wanted'),
	Devour = require('devour'),
	gutil = require('gulp-util'),
	fs = require('fs'),
	hjson = require('hjson');

function remainder(watch) {
	var list = [];

	Object.keys(watch).forEach(function(key) {
		list = list.concat(watch[key]);
	});

	return list;
}

function negate(list) {
	return list.map(function(pattern) {
		return pattern[0] === '!' ? pattern.substr(1) : '!' + pattern;
	}).sort(function(a, b) {
		var mA = +(a[0] === '!'),
			mB = +(b[0] === '!');

		return mA < mB ? -1 : +(mA > mB);
	});
}

(function(wanted){
	wanted
		.on('install', function(module) {
			//  accept all module installs/updates
			module.accept();

			gutil.log(
				'Wanted:',
				gutil.colors.magenta(module.name),
				gutil.colors.cyan(module.state),
				gutil.colors.yellow(module.version)
			);
		})
		.on('ready', function() {
			fs.readFile(__dirname + '/gulp/config/project.json', function(error, data) {
				var config = hjson.parse(String(data)),
					devour = new Devour(config),
					watch = {
						script: ['source/@(public)/@(script)/**/*.js'],
						style: ['source/@(public)/@(style)/**/*.css'],
						html: ['source/@(public|template)/**/*.html'],
						markdown: ['source/*/**/*.md'],
						vector: ['source/@(public)/@(media)/@(vector)/**/*.svg'],
						bitmap: ['source/@(public)/@(media)/@(image|bitmap)/**/*.(jpeg|jpeg|gif|png)']
					};

				devour
					//  add the script task, monitoring and building the public facing javascripts
					.task('script', watch.script)

					//  add the style task, monitoring and building the public facing stylesheet
					.task('style', watch.style)

					//  add the template task, monitoring and building the templates and any other public html file
					.task('html', watch.html)

					//  add the markdown task, monitoring and building any markdown (.md) file under source
					.task('markdown', watch.markdown)

					//  add the bitmap task, monitoring and building any bitmap (.jpg, .jpeg, .gif, .png) file under source/media/(bitmap|image)
					.task('bitmap', watch.bitmap)

					//  add the vector task, monitoring and building any vector (.svg) file under source/media/vector
					.task('vector', watch.vector)

					.task('copy', ['source/**/*'].concat(negate(remainder(watch))))

					//  add the server task, monitoring the index.js and every script in lib and restarting the main process
					.task('server', ['index.js', 'lib/**/*.js'])

					//  ... start devouring
					.start()
				;
			});
		})
		.check({scope:'devDependencies'})
	;
})(new Wanted());
