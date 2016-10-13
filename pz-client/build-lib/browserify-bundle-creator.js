var browserify = require('browserify');
var pzPath = require('pz-support/pz-path');

module.exports = function createBrowserifyBundle(browserifyOptions) {
    var browserified = browserify(Object.assign({}, browserifyOptions, {
        entries: pzPath('pz-client', 'build/src/index.js'),
        debug: true
    }));

    return browserified.bundle();
};
