var runSequence = require('pz-builder/build-lib/run-sequence');
var clean = require('pz-builder/build-lib/clean-task');
var createRelaySchema = require('pz-client/build-lib/create-relay-schema-task');
var buildServerSources = require('pz-server/build-lib/dev-build-sources-task');
var buildSources = require('pz-client/build-lib/dev-build-sources-task');
var buildStyles = require('pz-client/build-lib/dev-build-styles-task');
var pzSupport = require('pz-support/build-lib/build-dev-task');

module.exports = function(gulp) {
    var pzSupportTask = pzSupport(gulp);

    gulp.task('pzClient:buildDev', function(done) {
        runSequence.use(gulp)(
            clean(gulp, 'pz-client', 'pzClient:clean'),
            pzSupportTask,
            buildServerSources(gulp),
            createRelaySchema(gulp),
            [buildSources(gulp), buildStyles(gulp)],
            done
        );
    });

    return 'pzClient:buildDev';
};
