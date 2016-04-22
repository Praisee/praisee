var pzPath = require('pz-support/pz-path');
var buildDev = require('pz-server/build-lib/build-dev-task');
var buildSources = require('pz-server/build-lib/dev-build-sources-task');
var copyJsonFiles = require('pz-server/build-lib/copy-json-files-task');
var pzDomain = require('pz-domain/build-lib/watch-task');
var pzSupport = require('pz-support/build-lib/watch-task');

module.exports = function(gulp) {
    gulp.task('pzServer:watch:typescript', function() {
        return gulp.watch(['src/**/*.ts', 'src/**/*.js'], {cwd: pzPath('pz-server')}, [
            buildSources(gulp)
        ]);
    });
    
    gulp.task('pzServer:watch:jsonFiles', function() {
        return gulp.watch('src/**/*.json', {cwd: pzPath('pz-server')}, [
            copyJsonFiles(gulp)
        ]);
    });
    
    gulp.task('pzServer:watch', [
        buildDev(gulp),
        pzDomain(gulp),
        pzSupport(gulp),
        'pzServer:watch:typescript',
        'pzServer:watch:jsonFiles'
    ]);
    
    return 'pzServer:watch';
};
