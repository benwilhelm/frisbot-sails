module.exports = function(grunt) {

  // Add the grunt-mocha-test tasks.
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.config.set('mochaTest', {
    // Configure a mochaTest task
    test: {
      options: {
        reporter: 'spec',
      },
      src: ['test/**/*.js']
    }
  });

  grunt.registerTask('default', 'mochaTest');

};