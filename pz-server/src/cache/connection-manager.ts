var Redis = require('ioredis');

export interface IConnectionManager {
    getConnection(connectionName: string): any
}

export interface IRedisConfig {
    connections: {
        [connectionName: string]: {
            host: string
            databaseIndex: number
            port?: number
            isIpV6?: boolean
            password?: string
        }
    }
}

export class RedisConnectionManager implements IConnectionManager {
    private _connections = {};

    constructor() {
    }

    loadFromConfig(config: IRedisConfig) {
        const connections = Object.keys(config.connections).reduce(
            (connections, connectionName) => {
                const connectionConfig = config.connections[connectionName];

                connections[connectionName] = new Redis({
                    host: connectionConfig.host,
                    port: connectionConfig.port,
                    family: connectionConfig.isIpV6 ? 6 : 4,
                    password: connectionConfig.password,
                    db: connectionConfig.databaseIndex
                });

                return connections;
            }, {}
        );

        this._connections = connections;
    }

    getConnection(connectionName: string): IORedis.Redis {
        if (!this._connections.hasOwnProperty(connectionName)) {
            throw new Error('Redis connection does not exist for: ' + connectionName);
        }

        return this._connections[connectionName];
    }
}
