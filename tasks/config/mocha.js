module.exports = function(grunt) {

  // Add the grunt-mocha-test tasks.
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.config.set('mochaTest', {
    // Configure a mochaTest task

    test: {
      options: {
        reporter: 'spec',
        clearRequireCache: true, // necessary for selective testing based on watch files
        timeout: 5000
      },
      src: [
        'test/bootstrap.test.js',
        'test/unit/models/*.js',
        'test/unit/controllers/*.js',
        'test/unit/services/*.js'
      ]
    }
  });

};