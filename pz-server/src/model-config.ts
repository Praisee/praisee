import {pzPath, pzBuildPath} from 'pz-support/src/pz-path';

export default {
    '_meta': {
        'sources': [
            'loopback/common/models',
            'loopback/server/models',
            pzBuildPath('pz-domain', 'src/models'),
            pzBuildPath('pz-server', 'src/search/models'),
            pzBuildPath('pz-server', 'src/url-slugs/models'),
            './models'
        ],
        'mixins': [
            'loopback/common/mixins',
            'loopback/server/mixins',
            pzPath('pz-server', 'node_modules/loopback-ds-timestamp-mixin'),
            pzBuildPath('pz-domain', 'src/mixins'),
            pzBuildPath('pz-server', 'src/url-slugs/mixins'),
            './mixins'
        ]
    },
    
    // User
    'PraiseeUser': {
        'dataSource': 'vagrant-postgres',
        'public': true
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
    
    // Domain
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
        'public': true,
        '$promise': {},
        '$resolved': true
    },
    'Product': {
        'dataSource': 'vagrant-postgres',
        'public': true,
        '$promise': {},
        '$resolved': true
    },
    'Vote': {
        'dataSource': 'vagrant-postgres',
        'public': true,
        '$promise': {},
        '$resolved': true
    },
    'UrlSlug': {
        'dataSource': 'vagrant-postgres',
        'public': false
    },
    
    // Search
    'SearchUpdateJob': {
        'dataSource': 'vagrant-postgres',
        'public': false
    }
}
