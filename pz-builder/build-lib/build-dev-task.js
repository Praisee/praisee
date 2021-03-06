module.exports = function(gulp) {
    gulp.task('pzBuilder:buildDev', [
        require('pz-support/build-lib/build-dev-task')(gulp),
        require('pz-client/build-lib/build-dev-task')(gulp),
        require('pz-server/build-lib/build-dev-task')(gulp)
    ]);
    
    return 'pzBuilder:buildDev';
};
