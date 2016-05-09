var pzPath = require('pz-support/pz-path');
var buildDev = require('pz-domain/build-lib/build-dev-task');
var buildSources = require('pz-domain/build-lib/dev-build-sources-task');

module.exports = function(gulp) {
    var buildDevTask = buildDev(gulp);
    
    var watchedFiles = ['src/**/*.ts', 'src/**/*.js', 'src/**/*.json'];

    gulp.task('pzDomain:watch:sources', function() {
        return gulp.watch(watchedFiles, {cwd: pzPath('pz-domain')}, [
            buildSources(gulp)
        ]);
    });

    gulp.task('pzDomain:watch', [
        buildDevTask,
        'pzDomain:watch:sources'
    ]);

    return 'pzDomain:watch';
};

