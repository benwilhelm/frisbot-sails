var grunt = require('grunt')

module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-focus');

  grunt.config('focus', {
    dev: {
      include: ['test' /*, 'jshint' */]
    }
  })
}