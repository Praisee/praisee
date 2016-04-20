module.exports = function(gulp) {
    gulp.task('pzBuilder:watch', [
        require('pz-support/build-lib/watch-task')(gulp),
        require('pz-domain/build-lib/watch-task')(gulp),
        require('pz-server/build-lib/watch-task')(gulp)
    ]);
    
    return 'pzBuilder:watch';
};
