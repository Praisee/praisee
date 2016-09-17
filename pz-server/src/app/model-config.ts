import {pzPath, pzBuildPath} from 'pz-support/src/pz-path';

export default {
    '_meta': {
        'sources': [
            'loopback/common/models',
            'loopback/server/models',
            'loopback-component-passport/lib/models',
            pzBuildPath('pz-server', 'src/models'),
            pzBuildPath('pz-server', 'src/search/models'),
            pzBuildPath('pz-server', 'src/url-slugs/models')
        ],
        'mixins': [
            'loopback/common/mixins',
            'loopback/server/mixins',
            pzPath('pz-root', 'node_modules/loopback-ds-timestamp-mixin'),
            pzBuildPath('pz-server', 'src/url-slugs/mixins')
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
    'UserCredential': {
        'dataSource': 'vagrant-postgres',
        'public': false
    },
    'UserIdentity': {
        'dataSource': 'vagrant-postgres',
        'public': false
    },

    // -- Domain--

    // We need to put the junction table in for loopback to detect it in automigrations:
    // https://groups.google.com/forum/#!topic/loopbackjs/dKOI4UHqfcU
    // The link he refers it should be: https://github.com/strongloop/loopback-datasource-juggler/blob/master/lib/relation-definition.js#L1552-L1558
    'TopicCommunityItem': {
        'dataSource': 'vagrant-postgres',
        'public': false
    },
    'CommunityItem': {
        'dataSource': 'vagrant-postgres',
        'public': true,
    },
    'Comment': {
        'dataSource': 'vagrant-postgres',
        'public': true,
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
    'TopicAttribute': {
        'dataSource': 'vagrant-postgres',
        'public': false,
        '$promise': {},
        '$resolved': true
    },
    'Vote': {
        'dataSource': 'vagrant-postgres',
        'public': true,
        '$promise': {},
        '$resolved': true
    },
    'Photo': {
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
