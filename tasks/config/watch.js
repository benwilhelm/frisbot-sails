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

		jshint: {
			files: [
				'**/*.js',
				'!node_modules/**/*'
			],
			tasks: ['jshint'],
			optons: {
				spawn: false
			}
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
			tasks: ['syncAssets' , 'linkAssets'],

			options: {
				livereload: true
			}

		}
	});


	grunt.event.on('watch', function(action, filepath, subtask) {
	
		switch (subtask) {

			case 'test':
				var api  = filepath.match(/^api\/(.+)\.js$/)
				var test = filepath.match(/^test\/(.+)\.js$/)

				if (api) {
					var testPath = 'test/unit/' + api[1] + ".test.js"; 
					if (fs.existsSync(testPath)) {
						var src = [ 'test/bootstrap.test.js', testPath ]
						grunt.config('mochaTest.test.src', src)
					}
				}

				if (test) {
					grunt.config('mochaTest.test.src', [
						'test/bootstrap.test.js',
						filepath
					])
				}
				break;

		}

	})

	grunt.loadNpmTasks('grunt-contrib-watch');
};
