var runSequence = require('pz-builder/build-lib/run-sequence');
var clean = require('pz-builder/build-lib/clean-task');
var buildSources = require('pz-server/build-lib/dev-build-sources-task');
var copyJsonFiles = require('pz-server/build-lib/copy-json-files-task');

module.exports = function(gulp) {
    gulp.task('pzServer:buildDev', function(done) {
        runSequence.use(gulp)(
            clean(gulp, 'pz-server', 'pzServer:clean'),
            [buildSources(gulp), copyJsonFiles(gulp)],
            done
        );
    });
    
    return 'pzServer:buildDev';
};
