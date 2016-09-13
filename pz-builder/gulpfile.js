var gulp = require('gulp');

gulp.task('buildDev', [
    require('pz-builder/build-lib/build-dev-task')(gulp)
]);

gulp.task('buildProd', [
    require('pz-builder/build-lib/build-prod-task')(gulp)
]);

gulp.task('watch', [
    require('pz-builder/build-lib/watch-task')(gulp)
]);
