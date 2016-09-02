import modelConfig from 'pz-server/src/app/model-config';
import pzPath from 'pz-support/src/pz-path';

var appRootDir = pzPath('pz-server', 'src/app');
var workerAppRootDir = pzPath('pz-server', 'src/rankings/worker-app');

export default {
    appRootDir: workerAppRootDir,
    dsRootDir: appRootDir,
    models: modelConfig,

    bootScripts: [
        pzPath('pz-server', 'src/cache/initialize-cache'),
        pzPath('pz-server', 'src/app/repository-initializer'),
        pzPath('pz-server', 'src/rankings/worker-app/initialize-workers')
    ]
};
