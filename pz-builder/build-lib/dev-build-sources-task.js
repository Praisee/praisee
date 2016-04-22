var pzPath = require('pz-support/pz-path');
var typescript = require('gulp-typescript');
var babel = require('gulp-babel');
var cached = require('gulp-cached');
var gulpIf = require('gulp-if');
var gulpPrint = require('gulp-print');

module.exports = function(gulp, module, taskName, dependencies) {
    gulp.task(taskName, dependencies, function() {
        var tsConfig = require(pzPath(module, 'tsconfig.json'));

        return gulp
            .src([
                pzPath(module, 'src/**/*.ts'),
                pzPath(module, 'src/**/*.js')
            ])
            
            .pipe(gulpIf('!**/*.d.ts', cached(taskName)))
            
            .pipe(gulpPrint(function (filePath) {
                return 'Building ' + filePath;
            }))

            .pipe(gulpIf('**/*.ts', typescript(tsConfig.compilerOptions)))
            
            .pipe(babel({
                resolveModuleSource: function(source) {
                    return source.replace(/^(pz-[a-zA-Z0-9]+)/, '$1/build');
                }
            }))
            
            .pipe(gulp.dest(pzPath(module, 'build/src')))
        ;
    });

    return taskName;
};
