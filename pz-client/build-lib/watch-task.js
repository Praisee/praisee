var pzPath = require('pz-support/pz-path');
var buildDev = require('pz-client/build-lib/build-dev-task');
var buildSources = require('pz-client/build-lib/dev-build-sources-task');
var buildStyles = require('pz-client/build-lib/dev-build-styles-task');
var createRelaySchema = require('pz-client/build-lib/create-relay-schema-task');
var runSequence = require('pz-builder/build-lib/run-sequence');

module.exports = function(gulp) {
    var watchSourceFiles = [
        'src/**/*.ts',
        'src/**/*.tsx',
        'src/**/*.js',
        'src/**/*.json'
    ];
    
    var watchSourceFilesAndSchema = watchSourceFiles.concat('build/src/relay/schema.json');

    var watchStyleFiles = [
        'src/**/*.scss'
    ];

    gulp.task('pzClient:watch:sources', function() {
        return gulp.watch(watchSourceFilesAndSchema, {cwd: pzPath('pz-client')}, [
            buildSources(gulp)
        ]);
    });
    
    gulp.task('pzClient:watch:styles', function() {
        return gulp.watch(watchStyleFiles, {cwd: pzPath('pz-client')}, [
            buildStyles(gulp)
        ]);
    });
    
    gulp.task('pzClient:watch:graphqlSources', function() {
        const watchOptions = {cwd: pzPath('pz-server', 'build/src/graphql'), debounceDelay: 10000};
        
        return gulp.watch(['**/*.js', '**/*.json'], watchOptions, [
            createRelaySchema(gulp)
        ]);
    });
    
    gulp.task('pzClient:watch', function(done) {
        runSequence.use(gulp)(
            buildDev(gulp),
            
            [
                'pzClient:watch:sources',
                'pzClient:watch:styles',
                'pzClient:watch:graphqlSources'
            ],
            
            done
        );
    });

    return 'pzClient:watch';
};

