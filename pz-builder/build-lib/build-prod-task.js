module.exports = function(gulp) {
    gulp.task('pzBuilder:buildProd', [
        require('pz-support/build-lib/build-prod-task')(gulp),
        require('pz-client/build-lib/build-prod-task')(gulp),
        require('pz-server/build-lib/build-prod-task')(gulp)
    ]);

    return 'pzBuilder:buildProd';
};
