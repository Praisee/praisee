var gulp = require('gulp');

require('pz-support/build-lib/build-dev-task')(gulp);
gulp.task('buildDev', ['pzSupport:buildDev']);

require('pz-support/build-lib/watch-task')(gulp);
gulp.task('watch', ['pzSupport:watch']);
