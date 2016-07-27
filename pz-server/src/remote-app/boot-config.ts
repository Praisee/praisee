import modelConfig from 'pz-server/src/remote-app/model-config';
import dataSourcesConfig from 'pz-server/src/remote-app/datasources';
import pzPath from 'pz-support/src/pz-path';

export default {
    appRootDir: __dirname,
    models: modelConfig,
    dataSources: dataSourcesConfig,

    bootScripts: [
        pzPath('pz-server', 'src/app/repository-initializer')
    ]
};
