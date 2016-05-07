var gulp = require('gulp');

require('pz-client/build-lib/build-prod-task')(gulp);
gulp.task('buildProd', ['pzClient:buildProd']);

require('pz-client/build-lib/build-dev-task')(gulp);
gulp.task('buildDev', ['pzClient:buildDev']);

require('pz-client/build-lib/watch-task')(gulp);
gulp.task('watch', ['pzClient:watch']);
