var runSequence = require('pz-builder/build-lib/run-sequence');
var clean = require('pz-builder/build-lib/clean-task');
var buildSources = require('pz-server/build-lib/dev-build-sources-task');
var updateGraphqlSchema = require('pz-server/build-lib/update-graphql-schema-task');
var pzSupport = require('pz-support/build-lib/build-dev-task');
var pzDomain = require('pz-domain/build-lib/build-dev-task');
var pzClient = require('pz-client/build-lib/build-dev-task');

module.exports = function(gulp) {
    var pzSupportTask = pzSupport(gulp);
    var pzDomainTask = pzDomain(gulp);
    var pzClientTask = pzClient(gulp);
    
    gulp.task('pzServer:buildDev', function(done) {
        runSequence.use(gulp)(
            clean(gulp, 'pz-server', 'pzServer:clean'),
            [pzSupportTask, pzDomainTask, pzClientTask],
            [buildSources(gulp), updateGraphqlSchema(gulp)],
            done
        );
    });
    
    return 'pzServer:buildDev';
};
