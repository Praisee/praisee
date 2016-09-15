var path = require('path');
var paths = require('pz-client/build-lib/paths');
var pzPath = require('pz-support/pz-path');
var gulpPrint = require('gulp-print');
var errorHandler = require('pz-builder/build-lib/error-handler');
var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var modifyUrl = require('postcss-url');

module.exports = function(gulp) {
    gulp.task('pzClient:dev:buildStyles', function() {
        return (gulp
            .src(pzPath('pz-client', 'src/app/app.scss'))

            .pipe(errorHandler())
            
            .pipe(gulpPrint(function (filePath) {
                return 'Building style ' + filePath;
            }))

            .pipe(sass())

            .pipe(postcss([
                autoprefixer({ browsers: ['> 1%'] }),

                modifyUrl({
                    url: function(url) {
                        return path.join('/i/client/', url);
                    }
                })
            ]))

            .pipe(gulp.dest(paths.publicStylesDir()))
        );
    });

    return 'pzClient:dev:buildStyles';
};
