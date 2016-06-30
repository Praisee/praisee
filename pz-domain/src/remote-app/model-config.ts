import * as path from 'path';

// We need to reference our paths from the build directory because loopback
// uses the transpiled sources (located in the build directory) and then adds
// hardcoded paths into the Browserify build.
const buildDir = __dirname;

export default {
    '_meta': {
        'sources': [
            'loopback/common/models',
            path.join(buildDir, '../../../../pz-domain/build/src/models'),
            path.join(buildDir, 'models')
        ],
        'mixins': [
            'loopback/common/mixins',
            path.join(buildDir, '../../../../pz-server/node_modules/loopback-ds-timestamp-mixin'),
            path.join(buildDir, '../../../../pz-domain/build/src/mixins'),
            './mixins'
        ]
    },
    
    // User
    'User': {
        'dataSource': 'pz-remote', // This is an abstract model
        'public': false,
    },

    // Domain
    'CommunityItem': {
        'dataSource': 'memory-db', // This is an abstract model
        'public': false,
    },
    'Review': {
        'dataSource': 'pz-remote',
        'public': true,
        '$promise': {},
        '$resolved': true
    },
    'Comparison': {
        'dataSource': 'pz-remote',
        'public': true,
        '$promise': {},
        '$resolved': true
    },
    'Howto': {
        'dataSource': 'pz-remote',
        'public': true,
        '$promise': {},
        '$resolved': true
    },
    'Question': {
        'dataSource': 'pz-remote',
        'public': true,
        '$promise': {},
        '$resolved': true
    },
    'Topic': {
        'dataSource': 'pz-remote',
        'public': true
    },
    'Product': {
        'dataSource': 'pz-remote',
        'public': true
    },
    'Vote': {
        'dataSource': 'pz-remote',
        'public': true
    }
}
