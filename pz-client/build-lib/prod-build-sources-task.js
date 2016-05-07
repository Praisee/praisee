var paths = require('pz-client/build-lib/paths');
var browserifyBundleCreator = require('pz-client/build-lib/browserify-bundle-creator');
var transpile = require('pz-client/build-lib/transpile-task');
var copyJsonFiles = require('pz-client/build-lib/copy-json-files-task');
var gulpPrint = require('gulp-print');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');

module.exports = function(gulp) {
    var dependencies = [transpile(gulp), copyJsonFiles(gulp)];

    gulp.task('pzClient:prod:buildSources', dependencies, function() {
        return browserifyBundleCreator()
            .pipe(source('app.js'))
            .pipe(buffer())

            .pipe(gulpPrint(function (filePath) {
                return 'Building ' + filePath;
            }))
            
            .pipe(uglify())

            .pipe(gulp.dest(paths.publicScriptsDir()))
        ;
    });

    return 'pzClient:prod:buildSources';
};
