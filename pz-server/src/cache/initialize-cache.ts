import {RedisConnectionManager} from 'pz-server/src/cache/connection-manager';
import importJson from 'pz-support/src/import-json';

module.exports = function initializeCache(app: IApp) {
    const redisConfig = importJson('pz-server/src/cache/redis-config.json');

    app.services.cacheConnections = new RedisConnectionManager();
    app.services.cacheConnections.loadFromConfig(redisConfig);
};
