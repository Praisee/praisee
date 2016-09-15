var paths = require('pz-client/build-lib/paths');
var pzPath = require('pz-support/pz-path');
var gulpPrint = require('gulp-print');
var errorHandler = require('pz-builder/build-lib/error-handler');

module.exports = function (gulp) {
    gulp.task('pzClient:buildFontAwesome', function () {
        return (gulp
            .src(pzPath('pz-root', 'node_modules/font-awesome/fonts/**/*'))

            .pipe(errorHandler())

            .pipe(gulpPrint(function (filePath) {
                return 'Copying assets ' + filePath;
            }))

            .pipe(gulp.dest(paths.publicAssetsDir('fonts')))
        );
    });

    return 'pzClient:buildFontAwesome';
};
