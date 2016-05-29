var pzPath = require('pz-support/pz-path');
var buildDev = require('pz-client/build-lib/build-dev-task');
var buildSources = require('pz-client/build-lib/dev-build-sources-task');
var buildStyles = require('pz-client/build-lib/dev-build-styles-task');
var pzDomain = require('pz-domain/build-lib/watch-task');
var pzSupport = require('pz-support/build-lib/watch-task');

module.exports = function(gulp) {
    var watchSourceFiles = [
        'src/**/*.ts',
        'src/**/*.tsx',
        'src/**/*.js',
        'src/**/*.json',
        'styles/**/*.json'
    ];

    var watchStyleFiles = [
        'styles/**/*.scss'
    ];

    gulp.task('pzClient:watch:sources', function() {
        return gulp.watch(watchSourceFiles, {cwd: pzPath('pz-client')}, [
            buildSources(gulp)
        ]);
    });
    
    gulp.task('pzClient:watch:styles', function() {
        return gulp.watch(watchStyleFiles, {cwd: pzPath('pz-client')}, [
            buildStyles(gulp)
        ]);
    });

    gulp.task('pzClient:watch', [
        buildDev(gulp),
        pzDomain(gulp),
        pzSupport(gulp),
        'pzClient:watch:sources',
        'pzClient:watch:styles'
    ]);

    return 'pzClient:watch';
};

