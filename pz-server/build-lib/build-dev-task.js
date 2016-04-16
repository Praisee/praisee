var clean = require('pz-builder/build-lib/clean-task');
var buildSources = require('pz-builder/build-lib/dev/build-sources-task');
var copyJsonFiles = require('pz-builder/build-lib/copy-json-files-task');

module.exports = function(gulp) {
    gulp.task('pzServer:buildDev', [
        clean(gulp, 'pz-server', 'pzServer:clean'),
        
        buildSources(gulp, 'pz-server', 'pzServer:dev:buildSources', [
            'pzServer:clean'
        ]),
        
        copyJsonFiles(gulp, 'pz-server', 'pzServer:copyJsonFiles', [
            'pzServer:clean'
        ])
    ]);
};
