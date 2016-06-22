var gulp = require('gulp');
var runSequence = require('pz-builder/build-lib/run-sequence');

gulp.task('buildProd', [
    require('pz-client/build-lib/build-prod-task')(gulp)
]);

gulp.task('buildDev', [
    require('pz-client/build-lib/build-dev-task')(gulp)
]);

gulp.task('watch', [
    require('pz-client/build-lib/watch-task')(gulp)
]);

gulp.task('buildSourcesQuick', [
    require('pz-client/build-lib/build-sources-quick-task')(gulp)
]);

gulp.task('createRelaySchema', function(done) {
    runSequence.use(gulp)(
        require('pz-domain/build-lib/build-dev-task')(gulp),
        require('pz-client/build-lib/create-relay-schema-task')(gulp),
        done
    );
});
