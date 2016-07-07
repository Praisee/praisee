import modelConfig from 'pz-server/src/remote-app/model-config';
import dataSourcesConfig from 'pz-server/src/remote-app/datasources';

export default {
    appRootDir: __dirname,
    models: modelConfig,
    dataSources: dataSourcesConfig
};
