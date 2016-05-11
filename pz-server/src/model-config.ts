import pzPath from 'pz-support/src/pz-path';

export default {
    '_meta': {
        'sources': [
            'loopback/common/models',
            'loopback/server/models',
            pzPath('pz-domain', 'src/models'),
            pzPath('pz-domain', 'src/search-models'),
            './models'
        ],
        'mixins': [
            'loopback/common/mixins',
            'loopback/server/mixins',
            pzPath('pz-domain', 'src/mixins'),
            './mixins'
        ]
    },
    'User': {
        'dataSource': 'vagrant-postgres',
        'public': false
    },
    'AccessToken': {
        'dataSource': 'vagrant-postgres',
        'public': false
    },
    'ACL': {
        'dataSource': 'vagrant-postgres',
        'public': false
    },
    'RoleMapping': {
        'dataSource': 'vagrant-postgres',
        'public': false
    },
    'Role': {
        'dataSource': 'vagrant-postgres',
        'public': false
    },
    'CommunityItem': {
        'dataSource': 'memory-db', // This is an abstract model
        'public': false,
    },
    'Review': {
        'dataSource': 'vagrant-postgres',
        'public': true,
        '$promise': {},
        '$resolved': true
    },
    'Comparison': {
        'dataSource': 'vagrant-postgres',
        'public': true,
        '$promise': {},
        '$resolved': true
    },
    'Howto': {
        'dataSource': 'vagrant-postgres',
        'public': true,
        '$promise': {},
        '$resolved': true
    },
    'Question': {
        'dataSource': 'vagrant-postgres',
        'public': true,
        '$promise': {},
        '$resolved': true
    },
    'Topic': {
        'dataSource': 'vagrant-postgres',
        'public': true
    },
    'Vote': {
        'dataSource': 'vagrant-postgres',
        'public': true
    },
    'CommunityItemSearch': {
        'dataSource': 'vagrant-elasticsearch',
        'public': true // TODO: This needs to be false after testing
    },
    'TopicSearch': {
        'dataSource': 'vagrant-elasticsearch',
        'public': true // TODO: This needs to be false after testing
    }
}
