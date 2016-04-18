var gulp = require('gulp');

require('pz-support/build-lib/build-dev-task')(gulp);
gulp.task('buildDev', ['pzSupport:buildDev']);
