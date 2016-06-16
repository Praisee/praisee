import modelConfig from 'pz-client/src/loopback/model-config';
import dataSourcesConfig from 'pz-client/src/loopback/datasources';

export default {
    appRootDir: __dirname,
    models: modelConfig,
    dataSources: dataSourcesConfig
};
