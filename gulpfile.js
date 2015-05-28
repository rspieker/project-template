'use strict';

var Wanted = require('wanted'),
	Devour = require('devour'),
	gutil = require('gulp-util'),
	fs = require('fs'),
	hjson = require('hjson');

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
					devour = new Devour(config);

				devour
					//  add tasks

					//  add the server task, monitoring the index.js and every script in lib and restarting the main process
					.task('server', ['index.js', 'lib/**/*.js'])

					//  add the script task, monitoring and building the public facing javascripts
					.task('script', ['source/@(public)/@(script)/**/*.js'])

					//  add the style task, monitoring and building the public facing stylesheet
					.task('style', ['source/@(public)/@(style)/**/*.css'])

					//  add the template task, monitoring and building the templates and any other public html file
					.task('html', ['source/@(public|template)/**/*.html'])

					//  ... start devouring
					.start()
				;
			});
		})
		.check({scope:'devDependencies'})
	;
})(new Wanted());
