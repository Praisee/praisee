module.exports = function(gulp) {
    require('pz-server/build-lib/build-dev-task')(gulp);

    gulp.task('pzBuilder:buildDev', [
        'pzServer:buildDev'
    ]);
};
