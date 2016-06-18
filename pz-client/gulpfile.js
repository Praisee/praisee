var gulp = require('gulp');

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
