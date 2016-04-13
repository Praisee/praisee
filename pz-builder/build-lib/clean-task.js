var del = require('del');
var pzPath = require('pz-support/pz-path');

module.exports = function(gulp, module, taskName, dependencies) {
    gulp.task(taskName, dependencies, function() {
        return del(pzPath(module, 'build'), {force: true});
    });
    
    return taskName;
};

