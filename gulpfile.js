"use strict";

var gulp = require('gulp'),
	spawn = require('child_process').spawn,
	del = require('del'),
	fs = require('fs'),
	target = {
		src:  'source',
		dest: 'build'
	},
	copyright = 'Konfirm ⓒ ' + (new Date().getFullYear()),
	node;


function plug(name)
{
	if (!('buffer' in plug.prototype))
		plug.prototype.buffer = {};
	if (!(name in plug.prototype.buffer))
		plug.prototype.buffer[name] = require('gulp-' + name);

	return plug.prototype.buffer[name].apply(null, Array.prototype.slice.call(arguments, 1));
}

function min(file)
{
	file.basename = file.basename.replace(/\.prep/, '') + '.min';
}

function spoil(file)
{
	var resource = target.dest + '/public' + file,
		exists = fs.existsSync(resource),
		stat = exists ? fs.statSync(resource) : false,
		date = stat && stat.mtime ? stat.mtime : false;

	return '/static/' + ((date ? date.getTime() : Date.now() % 1000*60*60*24*365) / 1e3).toString(36) + file;
}


//  if the gulp process gets a kill signal, kill our node instance too
process.on('exit', function(){
	if (node)
		node.kill();
});

//  Start node
gulp.task('server', function(){
	if (node)
	{
		node.kill();
		console.log('Killed server');
	}

	node = spawn('node', ['index.js'], {stdio: 'inherit'});
	node.on('close', function (code){
		if (code === 8)
			console.log('Error detected, waiting for changes...');
	});
	console.log('Started server');
});

//  The build process
gulp.task('build', ['misc', 'images', 'process:style', 'process:script', 'template', 'markdown'], function(){
});

gulp.task('images', ['svg', 'bitmap'], function(){
});

//  some additional optimisations for konflux which we don't want to maintain in the development version, for
//  obvious reasons
gulp.task('konflux', function(){
	var replacements = {
			'KXDATE': /\bDate(?=\b)/g,
			'KXMATH': /\bMath(?=\b)/g,
			'KXOBJECT': /\'object\'/g,
			'KXFUNCTION': /\'function\'/g
		};

	return gulp.src(target.src + '/public/script/base/konflux.js')
		.pipe(plug('replace', replacements.KXDATE, 'KXDATE'))
		.pipe(plug('replace', replacements.KXMATH, 'KXMATH'))
		.pipe(plug('replace', replacements.KXOBJECT, 'KXOBJECT'))
		.pipe(plug('replace', replacements.KXFUNCTION, 'KXFUNCTION'))
		.pipe(plug('replace', /\'length\'/g, 'KXLENGTH'))
		.pipe(plug('replace', /\.length(?=\b)/g, '[KXLENGTH]'))
		.pipe(plug('replace', /var version/, 'var KXDATE=Date,KXMATH=Math,KXOBJECT=\'object\',KXFUNCTION=\'function\',KXLENGTH=\'length\',version'))
		.pipe(plug('rename', function(file){file.basename += '.prep';}))
		.pipe(gulp.dest(target.src + '/public/script/base/'))
	;
});

gulp.task('script', function(){
	return gulp.src([
			'!' + target.src + '/public/script/base/konflux.js',
			target.src + '/**/*.js'
		])
		.pipe(plug('uglify'))
		.pipe(plug('rename', min))
		.pipe(gulp.dest(target.dest))
		.pipe(plug('gzip'))
		.pipe(gulp.dest(target.dest))
	;
});
gulp.task('process:script', ['konflux', 'script'], function(){
	return gulp.src([
			'!' + target.dest + '/public/script/x/**/*.min.js',
			target.dest + '/public/script/var/**/*.min.js',
			target.dest + '/public/script/base/**/*.min.js',
			target.dest + '/public/script/**/*.min.js'
	])
		.pipe(plug('replace', /[\"']use strict[\"'];/i, ''))
		.pipe(plug('uglify'))
		.pipe(plug('concat', 'combined.js'))
		.pipe(gulp.dest(target.dest + '/public/script/'))
		.pipe(plug('gzip'))
		.pipe(gulp.dest(target.dest + '/public/script/'))
	;
});

//  Process the stylesheets
gulp.task('style', function(){
	return gulp.src(target.src + '/**/*.css')
		//  rewrite assets to be in /static and include a cache spoiler
		.pipe(plug('replace', /(?!static)\/((?:media|style|script)[^'"\)]+)/g, spoil))

		//  minify
		.pipe(plug('minify-css'))
		.pipe(plug('rename', min))
		.pipe(gulp.dest(target.dest))
		.pipe(plug('gzip'))
		.pipe(gulp.dest(target.dest))
	;
});
gulp.task('process:style', ['style'], function(){
	return gulp.src([
			'!' + target.dest + '/public/style/x/**/*.min.css',
			target.dest + '/public/style/var/**/*.min.css',
			target.dest + '/public/style/base/**/*.min.css',
			target.dest + '/public/style/**/*.min.css'
	])
		//  write the combined data to disk prior to myth application, otherwise the variables will not be known!?!?!?!
		.pipe(plug('concat', 'combined.css'))
		.pipe(gulp.dest(target.dest + '/public/style/'))

		.pipe(plug('myth'))
		.pipe(plug('minify-css'))
		.pipe(plug('concat', 'combined.css'))
		.pipe(gulp.dest(target.dest + '/public/style/'))
		.pipe(plug('gzip'))
		.pipe(gulp.dest(target.dest + '/public/style/'))
	;
});

//  Process HTML templates
gulp.task('template', function(){
	return gulp.src([
		target.src + '/template/**/*.html'
	])
		//  rewrite assets to be in /static and include a cache spoiler
		.pipe(plug('replace', /(?!static)\/((?:media|style|script)[^'"\)>]+)/g, spoil))
		//  minify inline scripts
		.pipe(plug('minify-inline-scripts'))
		//  minify html
		.pipe(plug('minify-html', {
			collapseWhitespace: true,
			collapseBooleanAttributes: false,
			removeAttributeQuotes: false
		}))
		//  and add our watermark
		.pipe(plug('replace', /(<!DOCTYPE [^>]+>)/, '$1\n<!-- ' + copyright + ' -->\n\n'))
		.pipe(gulp.dest(target.dest + '/template/'))
	;
});

//  Process SVG images (we specify '/public/media/vector', as we will be rasterising them into bitmaps and
//  exclude fonts)
gulp.task('svg', function(){
	return gulp.src([
		target.src + '/public/media/vector/**/*.svg'
	])
		.pipe(plug('replace', /(<!DOCTYPE [^>]+>)/, '$1\n<!-- ' + copyright + ' -->\n\n'))
		.pipe(gulp.dest(target.dest + '/public/media/vector/'))
		.pipe(plug('svgmin'))
		.pipe(plug('rename', min))
		.pipe(plug('replace', /^(.*)/, '<!--' + copyright + '-->$1'))
		.pipe(gulp.dest(target.dest + '/public/media/vector/'))
		.pipe(plug('raster'))
		.pipe(plug('rename', function(file){file.basename = file.basename.replace(/\.min/, '-svg');file.extname = '.png';}))
		.pipe(gulp.dest(target.dest + '/public/media/bitmap/'))
		.pipe(plug('imagemin'))
		.pipe(plug('rename', min))
		.pipe(gulp.dest(target.dest + '/public/media/bitmap/'))
	;
});

gulp.task('bitmap', function(){
	return gulp.src(target.src + '/public/**/*.+(gif|png|jpg|jpeg)')
		.pipe(plug('imagemin'))
		.pipe(plug('rename', min))
		.pipe(gulp.dest(target.dest + '/public/'))
	;
});

//  ensure plain copy for anything unhandled
gulp.task('misc', function(){
	return gulp.src(['!' + target.src + '/**/*.+(html|js|css|svg|png|gif|jpg)', target.src + '/**'])
		.pipe(gulp.dest(target.dest + '/'))
	;
});

gulp.task('markdown', function(){
	return gulp.src(target.src + '/**/*.md')
		.pipe(plug('markdown'))
		.pipe(gulp.dest(target.dest + '/'))
	;
});

//  clean out the destination
gulp.task('clean', function(done){
	del([target.dest + '/**'], done);
});

gulp.task('watch', function(){
	gulp.watch(['!' + target.src + '/**/*.+(html|js|css|svg|png|gif|jpg)', target.src + '/**'], ['misc']);
	gulp.watch([target.src + '/**/*.css'], ['process:style']);
	gulp.watch([target.src + '/**/*.js'], ['process:script']);
	gulp.watch([target.src + '/**/*.svg'], ['svg']);
	gulp.watch([target.src + '/**/*.+(gif|png|jpg|jpeg)'], ['bitmap']);
	gulp.watch([target.src + '/**/*.md'], ['markdown']);
	gulp.watch([target.src + '/template/**/*.html'], ['template']);
	gulp.watch([target.src + '/template/**/*.html', 'index.js', 'modules/**/*.js', 'config/**/*.json'], ['server']);
});

gulp.task('default', ['watch', 'build', 'server']);
