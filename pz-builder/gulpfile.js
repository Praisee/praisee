var gulp = require('gulp');

require('pz-builder/build-lib/build-dev-task')(gulp);
gulp.task('buildDev', ['pzBuilder:buildDev']);
