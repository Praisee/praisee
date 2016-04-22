var runSequence = require('pz-builder/build-lib/run-sequence');
var clean = require('pz-builder/build-lib/clean-task');
var buildSources = require('pz-domain/build-lib/dev-build-sources-task');
var copyJsonFiles = require('pz-domain/build-lib/copy-json-files-task');

module.exports = function(gulp) {
    gulp.task('pzDomain:buildDev', function(done) {
        runSequence.use(gulp)(
            clean(gulp, 'pz-domain', 'pzDomain:clean'),
            [buildSources(gulp), copyJsonFiles(gulp)],
            done
        );
    });
    
    return 'pzDomain:buildDev';
};
