var pzPath = require('pz-support/pz-path');

var paths = {
    publicDir: function(...additionalPath) {
        return pzPath('pz-client', 'build/public', ...additionalPath);
    },
    
    publicScriptsDir: function(...additionalPath) {
        return paths.publicDir('scripts', ...additionalPath);
    },
    
    publicStylesDir: function(...additionalPath) {
        return paths.publicDir('styles', ...additionalPath);
    },
    
    publicAssetsDir: function(...additionalPath) {
        return paths.publicDir('assets', ...additionalPath);
    },

    relaySchema: function () {
        return pzPath('pz-client', 'build/relay/schema.json');
    }
};

module.exports = paths;
