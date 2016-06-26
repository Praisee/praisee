import modelConfig from 'pz-server/src/model-config';
import pzPath from 'pz-support/src/pz-path';

export default {
    appRootDir: pzPath('pz-server', 'src'),
    models: modelConfig,
    
    bootScripts: [
        pzPath('pz-server', 'src/app/auto-update-models'),
        pzPath('pz-server', 'src/app/remote-app'),
        pzPath('pz-server', 'src/app/authentication'),
        pzPath('pz-server', 'src/app/graphql'),
        pzPath('pz-server', 'src/site/template-renderer'),
        pzPath('pz-server', 'src/site/site-route'),
        pzPath('pz-server', 'src/site/static-assets')
    ]
};
