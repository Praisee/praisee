var pzPath = require('pz-support/pz-path');
var typescript = require('gulp-typescript');
var babel = require('gulp-babel');
var cached = require('gulp-cached');
var gulpIf = require('gulp-if');
var gulpPrint = require('gulp-print');
var moduleResolver = require('pz-builder/build-lib/module-resolver');
var errorHandler = require('pz-builder/build-lib/error-handler');
var sourcemaps = require('gulp-sourcemaps');

module.exports = function(gulp, module, taskName, dependencies) {
    gulp.task(taskName, dependencies, function() {
        var tsConfig = require(pzPath(module, 'tsconfig.json'));
        
        var transpiledFiles = ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'];

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

            // Sourcemaps Initialization
            .pipe(gulpIf(transpiledFiles, sourcemaps.init()))

            // Transpile TypeScript
            .pipe(gulpIf(['**/*.ts', '**/*.tsx'], typescript(tsConfig.compilerOptions)))
            
            // Transpile ES6
            .pipe(gulpIf('**/*.js', babel({resolveModuleSource: moduleResolver})))
                
            // Sourcemaps Output
            .pipe(gulpIf(transpiledFiles, sourcemaps.write({
                sourceRoot: function(file) {
                    return pzPath(module);
                }
            })))
            
            .pipe(gulp.dest(pzPath(module, 'build')))
        ;
    });

    return taskName;
};
