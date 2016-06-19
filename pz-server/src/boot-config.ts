import modelConfig from 'pz-server/src/model-config';
import pzPath from 'pz-support/src/pz-path';

export default {
    appRootDir: __dirname,
    models: modelConfig,
    
    bootScripts: [
        // pzPath('pz-server', 'src/boot/search-initializer'), // Search initializer needs to come first
        // pzPath('pz-server', 'src/boot/auto-update-models')
    ]
};
