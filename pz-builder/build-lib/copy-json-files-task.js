var pzPath = require('pz-support/pz-path');

module.exports = function(gulp, module, taskName, dependencies) {
    gulp.task(taskName, dependencies, function() {
        return gulp
            .src([
                pzPath(module, 'src/**/*.json')
            ])

            .pipe(gulp.dest(pzPath(module, 'build/src')))
        ;
    });

    return taskName;
};
