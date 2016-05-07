var plumber = require('gulp-plumber');

module.exports = function errorHandler() {
    return plumber(function(error) {
        console.error(error.toString());
        this.emit('end');
    })
};
