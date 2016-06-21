/**
 * Build the source only, without any dependencies
 */

var runSequence = require('pz-builder/build-lib/run-sequence');
var buildSources = require('pz-server/build-lib/dev-build-sources-task');
var updateGraphqlSchema = require('pz-server/build-lib/update-graphql-schema-task');

module.exports = function(gulp) {
    gulp.task('pzServer:buildSourcesQuick', function(done) {
        runSequence.use(gulp)(
            [buildSources(gulp), updateGraphqlSchema(gulp)],
            done
        );
    });

    return 'pzServer:buildSourcesQuick';
};
