var fs = require('fs');
var path = require('path');
var pzPath = require('pz-support/pz-path');
var graphql = require('graphql').graphql;
var introspectionQuery = require('graphql/utilities').introspectionQuery;
// var printSchema = require('graphql/utilities').printSchema;
var buildSources = require('pz-server/build-lib/dev-build-sources-task');

module.exports = function(gulp) {
    var dependencies = [buildSources(gulp)];

    gulp.task('pzServer:updateGraphqlSchema', dependencies, function() {
        var PzServer = require('pz-server/build/src/server').default;
        var createSchema = require('pz-server/build/src/graphql/schema-creator').default;

        var pzServer = new PzServer();

        // Save JSON of full schema introspection for Babel Relay Plugin to use
        return (Promise.resolve()
            .then(function() {
                return pzServer.boot();
            })

            .then(function() {
                return createSchema(pzServer.app);
            })

            .then(function(schema) {
                return graphql(schema, introspectionQuery);
            })

            .then(function (result) {
                if (result.errors) {
                    console.error(
                        'ERROR introspecting schema: ',
                        JSON.stringify(result.errors, null, 2)
                    );

                } else {
                    fs.writeFileSync(
                        pzPath('pz-server', 'build/src/graphql/schema.json'),
                        JSON.stringify(result, null, 2)
                    );
                }
            })
            
            .then(function () {
                return pzServer.stop();
            })
        );
    });

    return 'pzServer:updateGraphqlSchema';
};

