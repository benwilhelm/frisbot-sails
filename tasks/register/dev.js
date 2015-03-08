module.exports = function(grunt){
  grunt.registerTask('dev', ['mochaTest', 'jshint:all', 'focus:dev']);
}