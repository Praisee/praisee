var pzPath = require('pz-support/pz-path');
var buildDev = require('pz-client/build-lib/build-dev-task');
var buildSources = require('pz-client/build-lib/dev-build-sources-task');
var pzDomain = require('pz-domain/build-lib/watch-task');
var pzSupport = require('pz-support/build-lib/watch-task');

module.exports = function(gulp) {
    var watchFiles = ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.js', 'src/**/*.json'];

    gulp.task('pzClient:watch:sources', function() {
        return gulp.watch(watchFiles, {cwd: pzPath('pz-client')}, [
            buildSources(gulp)
        ]);
    });

    gulp.task('pzClient:watch', [
        buildDev(gulp),
        pzDomain(gulp),
        pzSupport(gulp),
        'pzClient:watch:sources'
    ]);

    return 'pzClient:watch';
};

