import {RedisConnectionManager} from 'pz-server/src/cache/connection-manager';
import redisConfig from 'pz-server/src/cache/redis-config';

module.exports = function initializeCache(app: IApp) {
    app.services.cacheConnections = new RedisConnectionManager();
    app.services.cacheConnections.loadFromConfig(redisConfig);
};
