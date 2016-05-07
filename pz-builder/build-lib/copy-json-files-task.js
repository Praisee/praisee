var pzPath = require('pz-support/pz-path');
var cached = require('gulp-cached');
var gulpPrint = require('gulp-print');
var errorHandler = require('pz-builder/build-lib/error-handler');

module.exports = function(gulp, module, taskName, dependencies) {
    gulp.task(taskName, dependencies, function() {
        return gulp
            .src([
                pzPath(module, 'src/**/*.json')
            ])
            
            .pipe(errorHandler())
            
            .pipe(cached(taskName))
            
            .pipe(gulpPrint(function (filePath) {
                return 'Copying ' + filePath;
            }))

            .pipe(gulp.dest(pzPath(module, 'build/src')))
        ;
    });

    return taskName;
};
