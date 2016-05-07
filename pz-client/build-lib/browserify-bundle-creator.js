var browserify = require('browserify');
var pzPath = require('pz-support/pz-path');

module.exports = function createBrowserifyBundle() {
    return browserify({
        entries: pzPath('pz-client', 'build/src/app.js'),
        debug: true
    }).bundle()
};
