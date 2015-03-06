var fs = require('fs');

/**
 * Run predefined tasks whenever watched file patterns are added, changed or deleted.
 *
 * ---------------------------------------------------------------
 *
 * Watch for changes on
 * - files in the `assets` folder
 * - the `tasks/pipeline.js` file
 * and re-run the appropriate tasks.
 *
 * For usage docs see:
 * 		https://github.com/gruntjs/grunt-contrib-watch
 *
 */
module.exports = function(grunt) {

	grunt.config.set('watch', {
		api: {

			// API files to watch:
			files: ['api/**/*']
		},

		test: {
			files: ['api/**/*', 'test/**/*.js'],
			tasks: ['mochaTest'],
      options: {
        spawn: false
      }
		},

		assets: {

			// Assets to watch:
			files: ['assets/**/*', 'tasks/pipeline.js'],

			// When assets are changed:
			tasks: ['syncAssets' , 'linkAssets']
		}
	});


	grunt.event.on('watch', function(action, filepath){
		var match = filepath.match(/^api\/(.+)\.js$/)

		console.log(match)

		if (match) {
			var testPath = 'test/unit/' + match[1] + ".test.js"; 
			console.log(testPath);
			if (fs.existsSync(testPath)) {
				console.log('exists')
				grunt.config('mochaTest.test.src', [
					'test/bootstrap.test.js',
					testPath
				])
			}
		}

	})

	grunt.loadNpmTasks('grunt-contrib-watch');
};
