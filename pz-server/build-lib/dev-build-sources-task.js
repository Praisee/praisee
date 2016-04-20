var buildSources = require('pz-builder/build-lib/dev-build-sources-task');
var pzSupport = require('pz-support/build-lib/build-dev-task');
var pzDomain = require('pz-domain/build-lib/build-dev-task');

module.exports = function(gulp) {
    var pzSupportTask = pzSupport(gulp);
    var pzDomainTask = pzDomain(gulp);
    
    return buildSources(gulp, 'pz-server', 'pzServer:dev:buildSources', [
        pzSupportTask, pzDomainTask
    ]);
};
