var gulp = require('gulp');

require('pz-domain/build-lib/build-dev-task')(gulp);
gulp.task('buildDev', ['pzDomain:buildDev']);
