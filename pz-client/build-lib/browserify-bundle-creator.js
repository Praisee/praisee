var browserify = require('browserify');
var pzPath = require('pz-support/pz-path');
var loopbackBoot = require('loopback-boot');

module.exports = function createBrowserifyBundle() {
    var browserified = browserify({
        entries: pzPath('pz-client', 'build/src/app.js'),
        debug: true
    });
    
    browserified.require(
        pzPath('pz-client', 'build/src/loopback/loopback-app'),
        { expose: 'loopback-app' }
    );
    
    var bootConfig = require('pz-client/build/src/loopback/boot-config');
    bootConfig = bootConfig.default || bootConfig;
    
    // Loopback mutates the config, so we need a fresh copy every time. Shame on them.
    bootConfig = JSON.parse(JSON.stringify(bootConfig));
    
    loopbackBoot.compileToBrowserify(
        bootConfig,
        browserified
    );
        
    return browserified.bundle();
};
