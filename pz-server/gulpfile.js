var gulp = require('gulp');

require('pz-server/build-lib/build-dev-task')(gulp);
gulp.task('buildDev', ['pzServer:buildDev']);
