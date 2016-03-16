module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);
    
    var pzPath = require('pz-support/src/pz-path');
    var pzModules = ['pz-server', 'pz-client', 'pz-domain', 'pz-support'];
    
    function pzModuleWatcher(pzModule) {
        return {
            files: [pzPath(pzModule) + '/src/**/*.js'],
            tasks: ['newer:babel:buildDev']
        }
    }

    grunt.initConfig({
        babel: {
            buildDev: {
                files: pzModules.map(function(pzModule) { return {
                    expand: true,
                    cwd: pzPath(pzModule, 'src/'),
                    src: ['**/*.js'],
                    dest: 'build/node_modules/' + pzModule + '/src'
                }}),

                options: {
                    sourceMap: 'inline'
                }
            }
        },
        
        clean: {
            files: ['build/']
        },

        watch: {
            watchPzServerSrc: pzModuleWatcher('pz-server'),
            watchPzClientSrc: pzModuleWatcher('pz-client'),
            watchPzDomainSrc: pzModuleWatcher('pz-domain'),
            watchPzSupportSrc: pzModuleWatcher('pz-support')
        }
    });

    grunt.registerTask('buildDev', ['clean', 'babel:buildDev']);
    grunt.registerTask('buildAndWatch', ['buildDev', 'watch']);
};