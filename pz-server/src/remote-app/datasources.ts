import serverInfo from 'pz-server/src/app/server-info';

export default {
    'memory-db': {
        'name': 'memory-db',
        'connector': 'memory'
    },

    'pz-remote': {
        'connector': 'remote',
        'url': `http://${serverInfo.getHost()}/i/api`
    }
}
