var paths = require('pz-client/build-lib/paths');
var browserifyBundleCreator = require('pz-client/build-lib/browserify-bundle-creator');
var transpile = require('pz-client/build-lib/transpile-task');
var pzPath = require('pz-support/pz-path');
var gulpPrint = require('gulp-print');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

module.exports = function(gulp) {
    var dependencies = [transpile(gulp)];

    gulp.task('pzClient:dev:buildSources', dependencies, function() {
        return (browserifyBundleCreator()
            .on('error', function (error) {
                console.error(error.toString());
                this.emit("end");
            })
            
            .pipe(source('index.js'))
            .pipe(buffer())

            .pipe(gulpPrint(function (filePath) {
                return 'Building ' + filePath;
            }))

            .pipe(gulp.dest(paths.publicScriptsDir()))
        );
    });

    return 'pzClient:dev:buildSources';
};
