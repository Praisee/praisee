import importJson from 'pz-support/src/import-json';

const appConfig = importJson('pz-server/src/app/config');

var serverInfo = {
    getHostname() {
        return appConfig.host || '0.0.0.0';
    },

    getPort() {
        return process.env.PORT || 3000;
    },

    getHost() {
        return `${serverInfo.getHostname()}:${serverInfo.getPort()}`;
    },

    environmentType() {
        return process.env.NODE_ENV;
    },

    isProductionEnv() {
        return serverInfo.environmentType() === 'production';
    }
};

export default serverInfo;
