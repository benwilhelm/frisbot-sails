var grunt = require('grunt');

module.exports = function(grunt) {
  
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.config('jshint', {

    all: {
      src: ['./**/*.js'],
      options: {
        asi: true, // don't warn about semicolons
        laxbreak: true,
        laxcomma: true,
        ignores: [
          'node_modules/**/*',
          'assets/js/dependencies/**/*'
        ],
        globals: {
          jQuery: true,
          '$': true,
          '_': true
        }
      }
    }

  })
}