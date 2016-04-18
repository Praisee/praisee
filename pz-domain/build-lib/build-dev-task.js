var clean = require('pz-builder/build-lib/clean-task');
var buildSources = require('pz-builder/build-lib/dev/build-sources-task');
var copyJsonFiles = require('pz-builder/build-lib/copy-json-files-task');

module.exports = function(gulp) {
    gulp.task('pzDomain:buildDev', [
        clean(gulp, 'pz-domain', 'pzDomain:clean'),
        
        buildSources(gulp, 'pz-domain', 'pzDomain:dev:buildSources', [
            'pzDomain:clean'
        ]),
        
        copyJsonFiles(gulp, 'pz-domain', 'pzDomain:copyJsonFiles', [
            'pzDomain:clean'
        ])
    ]);
    
    return 'pzDomain:buildDev';
};
