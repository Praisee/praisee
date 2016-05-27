var plumber = require('gulp-plumber');

module.exports = function errorHandler(onError) {
    return plumber(function(error) {
        if (onError) {
            onError(error);
        }
        
        console.error(error.toString());
        this.emit('end');
    })
};
