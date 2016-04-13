var cleanTask = require('pz-builder/build-lib/clean-task');
var buildSources = require('pz-builder/build-lib/dev/build-sources-task');

module.exports = function(gulp) {
    gulp.task('pzServer:buildDev', [
        cleanTask(gulp, 'pz-server', 'pzServer:clean'),
        
        buildSources(gulp, 'pz-server', 'pzServer:dev:buildSources', [
            'pzServer:clean'
        ])
    ]);
};
