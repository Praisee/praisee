var pzPath = require('pz-support/pz-path');
var typescript = require('gulp-typescript');
var babel = require('gulp-babel');

module.exports = function(gulp, module, taskName, dependencies) {
    gulp.task(taskName, dependencies, function() {
        var tsConfig = require(pzPath(module, 'tsconfig.json'));

        return gulp
            .src([
                pzPath(module, 'src/**/*.ts')
            ])

            .pipe(typescript(tsConfig.compilerOptions))
            
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
