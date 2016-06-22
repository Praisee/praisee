var browserify = require('browserify');
var pzPath = require('pz-support/pz-path');
var loopbackBoot = require('loopback-boot');

module.exports = function createBrowserifyBundle() {
    var browserified = browserify({
        entries: pzPath('pz-client', 'build/src/index.js'),
        debug: true
    });
        
    return browserified.bundle();
};
