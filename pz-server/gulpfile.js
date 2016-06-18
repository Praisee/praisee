var gulp = require('gulp');

gulp.task('buildDev', [
    require('pz-server/build-lib/build-dev-task')(gulp)
]);

gulp.task('watch', [
    require('pz-server/build-lib/watch-task')(gulp)
]);

gulp.task('buildSourcesQuick', [
    require('pz-server/build-lib/build-sources-quick-task')(gulp)
]);
