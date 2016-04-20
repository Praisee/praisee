var runSequence = require('pz-builder/build-lib/run-sequence');
var clean = require('pz-builder/build-lib/clean-task');
var buildSources = require('pz-support/build-lib/dev-build-sources-task');
var copyJsonFiles = require('pz-support/build-lib/copy-json-files-task');

module.exports = function(gulp) {
    gulp.task('pzSupport:buildDev', runSequence.use(gulp)(
        clean(gulp, 'pz-support', 'pzSupport:clean'),
        
        [buildSources(gulp), copyJsonFiles(gulp)]
    ));
    
    return 'pzSupport:buildDev';
};
