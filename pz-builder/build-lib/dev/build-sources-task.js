var pzPath = require('pz-support/pz-path');
var typescript = require('gulp-typescript');
var babel = require('gulp-babel');

module.exports = function(gulp, module, taskName, dependencies) {
    gulp.task(taskName, dependencies, function() {
        var typescriptProject = typescript.createProject(
            pzPath(module, 'tsconfig.json')
        );
        
        return typescriptProject
            .src([
                pzPath(module, 'src/**/*.ts')
            ], {base: module})

            .pipe(typescript(typescriptProject))
            .pipe(babel())
            
            .pipe(gulp.dest(pzPath(module, 'build')))
        ;
    });
    
    return taskName;
};
