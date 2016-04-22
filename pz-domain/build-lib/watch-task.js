var pzPath = require('pz-support/pz-path');
var buildDev = require('pz-domain/build-lib/build-dev-task');
var buildSources = require('pz-domain/build-lib/dev-build-sources-task');
var copyJsonFiles = require('pz-domain/build-lib/copy-json-files-task');

module.exports = function(gulp) {
    var buildDevTask = buildDev(gulp);

    gulp.task('pzDomain:watch:typescript', function() {
        return gulp.watch(['src/**/*.ts', 'src/**/*.js'], {cwd: pzPath('pz-domain')}, [
            buildSources(gulp)
        ]);
    });

    gulp.task('pzDomain:watch:jsonFiles', function() {
        return gulp.watch('src/**/*.json', {cwd: pzPath('pz-domain')}, [
            copyJsonFiles(gulp)
        ]);
    });

    gulp.task('pzDomain:watch', [
        buildDevTask,
        'pzDomain:watch:typescript',
        'pzDomain:watch:jsonFiles'
    ]);

    return 'pzDomain:watch';
};

