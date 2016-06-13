var pzPath = require('pz-support/pz-path');
var typescript = require('gulp-typescript');
var babel = require('gulp-babel');
var cached = require('gulp-cached');
var gulpIf = require('gulp-if');
var gulpPrint = require('gulp-print');
var moduleResolver = require('pz-builder/build-lib/module-resolver');
var errorHandler = require('pz-builder/build-lib/error-handler');

module.exports = function(gulp, module, taskName, dependencies) {
    gulp.task(taskName, dependencies, function() {
        var tsConfig = require(pzPath(module, 'tsconfig.json'));

        return gulp
            .src([
                pzPath(module, 'src/**/*'),
                pzPath(module, 'test/**/*')
            ], {base: pzPath(module)})
            
            .pipe(errorHandler(function () {
                delete cached.caches[taskName];
            }))
            
            .pipe(gulpIf('!**/*.d.ts', cached(taskName)))
            
            .pipe(gulpPrint(function (filePath) {
                return 'Building ' + filePath;
            }))

            .pipe(gulpIf(['**/*.ts', '**/*.tsx'], typescript(tsConfig.compilerOptions)))
            
            .pipe(gulpIf('**/*.js', babel({resolveModuleSource: moduleResolver})))
            
            .pipe(gulp.dest(pzPath(module, 'build')))
        ;
    });

    return taskName;
};
