var runSequence = require('pz-builder/build-lib/run-sequence');
var clean = require('pz-builder/build-lib/clean-task');
var buildSources = require('pz-client/build-lib/prod-build-sources-task');
var buildStyles = require('pz-client/build-lib/dev-build-styles-task');
var pzSupport = require('pz-support/build-lib/build-dev-task');
var pzDomain = require('pz-domain/build-lib/build-dev-task');

module.exports = function(gulp) {
    var pzSupportTask = pzSupport(gulp);
    var pzDomainTask = pzDomain(gulp);

    gulp.task('pzClient:buildProd', function(done) {
        runSequence.use(gulp)(
            clean(gulp, 'pz-client', 'pzClient:clean'),
            [pzSupportTask, pzDomainTask],
            [buildSources(gulp), buildStyles(gulp)],
            done
        );
    });

    return 'pzClient:buildProd';
};
