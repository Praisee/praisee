module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        babel: {
            buildDev: {
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: ['**/*.js'],
                    dest: 'build/src'
                }],

                options: {
                    sourceMap: 'inline'
                }
            }
        },
        
        clean: {
            files: ['build/']
        },

        watch: {
            watchSrc: {
                files: ['src/**/*.js'],
                tasks: ['newer:babel:buildDev']
            }
        }
    });

    grunt.registerTask('buildDev', ['clean', 'babel:buildDev']);
};