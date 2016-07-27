var fs = require('fs');
var paths = require('pz-client/build-lib/paths');
var source = require('vinyl-source-stream');
var requireClean = require('require-clean');
var graphql = require('graphql').graphql;
var introspectionQuery = require('graphql/utilities').introspectionQuery;
// var printSchema = require('graphql/utilities').printSchema;

module.exports = function(gulp) {
    var dependencies = [];

    gulp.task('pzClient:createRelaySchema', dependencies, function() {
        requireClean('pz-server/build/src/remote-app/app-creator');
        var createRemoteApp = require('pz-server/build/src/remote-app/app-creator').default;

        requireClean('pz-server/build/src/graphql/schema-creator');
        var createSchema = require('pz-server/build/src/graphql/schema-creator').default;

        var stream = source(paths.relaySchema());

        // Save JSON of full schema introspection for Babel Relay Plugin to use
        (Promise.resolve()
            .then(function() {
                return createRemoteApp();
            })

            .then(function(app) {
                return createSchema(app.services.repositoryAuthorizers);
            })

            .then(function(schema) {
                return graphql(schema, introspectionQuery);
            })

            .then(function(result) {
                if (result.errors) {
                    console.error(
                        'ERROR introspecting schema: ',
                        JSON.stringify(result.errors, null, 2)
                    );

                    console.error(result.errors);

                } else {
                    stream.end(
                        JSON.stringify(result, null, 2)
                    );
                }
            })

            .catch(function (error) {
                console.trace(error);
                throw error;
            })
        );

        return stream.pipe(gulp.dest(function(file) { return file.base }));
    });

    return 'pzClient:createRelaySchema';
};

