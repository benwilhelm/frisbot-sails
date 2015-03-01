module.exports = function(grunt){
  grunt.registerTask('watchTest', ['mochaTest', 'watch:test']);
}