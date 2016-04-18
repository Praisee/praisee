var pzSupport = require('pz-support/build-lib/build-dev-task');
var pzDomain = require('pz-domain/build-lib/build-dev-task');
var clean = require('pz-builder/build-lib/clean-task');
var buildSources = require('pz-builder/build-lib/dev/build-sources-task');
var copyJsonFiles = require('pz-builder/build-lib/copy-json-files-task');

module.exports = function(gulp) {
    var pzSupportTask = pzSupport(gulp);
    var pzDomainTask = pzDomain(gulp);
    
    gulp.task('pzServer:buildDev', [
        clean(gulp, 'pz-server', 'pzServer:clean'),
        
        buildSources(gulp, 'pz-server', 'pzServer:dev:buildSources', [
            'pzServer:clean', pzSupportTask, pzDomainTask
        ]),
        
        copyJsonFiles(gulp, 'pz-server', 'pzServer:copyJsonFiles', [
            'pzServer:clean'
        ])
    ]);
    
    return 'pzServer:buildDev';
};
