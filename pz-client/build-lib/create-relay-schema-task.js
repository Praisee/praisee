var fs = require('fs');
var paths = require('pz-client/build-lib/paths');
var source = require('vinyl-source-stream');
var requireClean = require('require-clean');

// We need to use the same GraphQL as pz-domain due to an instanceof bug
// See https://github.com/graphql/graphiql/issues/58#issuecomment-193468718
var graphql = require('pz-domain/node_modules/graphql').graphql;
var introspectionQuery = require('pz-domain/node_modules/graphql/utilities').introspectionQuery;
// var printSchema = require('pz-domain/node_modules/graphql/utilities').printSchema;

module.exports = function(gulp) {
    var dependencies = [];

    gulp.task('pzClient:createRelaySchema', dependencies, function() {
        requireClean('pz-domain/build/src/remote-app/app-creator');
        var createRemoteApp = require('pz-domain/build/src/remote-app/app-creator').default;

        requireClean('pz-domain/build/src/graphql/schema-creator');
        var createSchema = require('pz-domain/build/src/graphql/schema-creator').default;
        
        var stream = source(paths.relaySchema());

        // Save JSON of full schema introspection for Babel Relay Plugin to use
        (Promise.resolve()
            .then(function() {
                return createRemoteApp();
            })

            .then(function(app) {
                return createSchema(app);
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

