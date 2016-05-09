var pzPath = require('pz-support/pz-path');
var buildDev = require('pz-support/build-lib/build-dev-task');
var buildSources = require('pz-support/build-lib/dev-build-sources-task');

module.exports = function(gulp) {
    var buildDevTask = buildDev(gulp);
    
    var watchedFiles = ['src/**/*.ts', 'src/**/*.js', 'src/**/*.json'];

    gulp.task('pzSupport:watch:sources', function() {
        return gulp.watch(watchedFiles, {cwd: pzPath('pz-support')}, [
            buildSources(gulp)
        ]);
    });

    gulp.task('pzSupport:watch', [
        buildDevTask,
        'pzSupport:watch:sources'
    ]);

    return 'pzSupport:watch';
};

