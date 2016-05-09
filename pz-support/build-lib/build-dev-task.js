var runSequence = require('pz-builder/build-lib/run-sequence');
var clean = require('pz-builder/build-lib/clean-task');
var buildSources = require('pz-support/build-lib/dev-build-sources-task');

module.exports = function(gulp) {
    gulp.task('pzSupport:buildDev', function(done) {
        runSequence.use(gulp)(
            clean(gulp, 'pz-support', 'pzSupport:clean'),
            [buildSources(gulp)],
            done
        );
    });
    
    return 'pzSupport:buildDev';
};
