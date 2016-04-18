var clean = require('pz-builder/build-lib/clean-task');
var buildSources = require('pz-builder/build-lib/dev/build-sources-task');
var copyJsonFiles = require('pz-builder/build-lib/copy-json-files-task');

module.exports = function(gulp) {
    gulp.task('pzSupport:buildDev', [
        clean(gulp, 'pz-support', 'pzSupport:clean'),
        
        buildSources(gulp, 'pz-support', 'pzSupport:dev:buildSources', [
            'pzSupport:clean'
        ]),
        
        copyJsonFiles(gulp, 'pz-support', 'pzSupport:copyJsonFiles', [
            'pzSupport:clean'
        ])
    ]);
    
    return 'pzSupport:buildDev';
};
