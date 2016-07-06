var runSequence = require('pz-builder/build-lib/run-sequence');
var clean = require('pz-builder/build-lib/clean-task');
var buildSources = require('pz-server/build-lib/dev-build-sources-task');
var pzSupport = require('pz-support/build-lib/build-dev-task');
var pzClient = require('pz-client/build-lib/build-dev-task');

module.exports = function(gulp) {
    var pzSupportTask = pzSupport(gulp);
    var pzClientTask = pzClient(gulp);
    
    gulp.task('pzServer:buildDev', function(done) {
        runSequence.use(gulp)(
            clean(gulp, 'pz-server', 'pzServer:clean'),
            [pzSupportTask, pzClientTask],
            [buildSources(gulp)],
            done
        );
    });
    
    return 'pzServer:buildDev';
};
