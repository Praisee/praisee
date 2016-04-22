var gulp = require('gulp');

require('pz-domain/build-lib/build-dev-task')(gulp);
gulp.task('buildDev', ['pzDomain:buildDev']);

require('pz-domain/build-lib/watch-task')(gulp);
gulp.task('watch', ['pzDomain:watch']);
