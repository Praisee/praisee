var pzPath = require('pz-support/pz-path');
var buildDev = require('pz-server/build-lib/build-dev-task');
var buildSources = require('pz-server/build-lib/dev-build-sources-task');
var pzDomain = require('pz-domain/build-lib/watch-task');
var pzSupport = require('pz-support/build-lib/watch-task');
var pzClient = require('pz-client/build-lib/watch-task');

module.exports = function(gulp) {
    gulp.task('pzServer:watch:sources', function() {
        return gulp.watch(
            ['src/**/*'],
            {cwd: pzPath('pz-server')},
            [buildSources(gulp)]
        );
    });

    gulp.task('pzServer:watch', [
        buildDev(gulp),
        pzDomain(gulp),
        pzSupport(gulp),
        pzClient(gulp),
        'pzServer:watch:sources'
    ]);

    return 'pzServer:watch';
};
