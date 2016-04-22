var pzPath = require('pz-support/pz-path');
var buildDev = require('pz-support/build-lib/build-dev-task');
var buildSources = require('pz-support/build-lib/dev-build-sources-task');
var copyJsonFiles = require('pz-support/build-lib/copy-json-files-task');

module.exports = function(gulp) {
    var buildDevTask = buildDev(gulp);

    gulp.task('pzSupport:watch:typescript', function() {
        return gulp.watch(['src/**/*.ts', 'src/**/*.js'], {cwd: pzPath('pz-support')}, [
            buildSources(gulp)
        ]);
    });

    gulp.task('pzSupport:watch:jsonFiles', function() {
        return gulp.watch('src/**/*.json', {cwd: pzPath('pz-support')}, [
            copyJsonFiles(gulp)
        ]);
    });

    gulp.task('pzSupport:watch', [
        buildDevTask,
        'pzSupport:watch:typescript',
        'pzSupport:watch:jsonFiles'
    ]);

    return 'pzSupport:watch';
};

