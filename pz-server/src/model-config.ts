import pzPath from 'pz-support/src/pz-path';

export default {
  '_meta': {
    'sources': [
      'loopback/common/models',
      'loopback/server/models',
      pzPath('pz-domain', 'src/models'),
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
    'dataSource': 'memory-db',
    'public': false
  },
  'AccessToken': {
    'dataSource': 'memory-db',
    'public': false
  },
  'ACL': {
    'dataSource': 'memory-db',
    'public': false
  },
  'RoleMapping': {
    'dataSource': 'memory-db',
    'public': false
  },
  'Role': {
    'dataSource': 'memory-db',
    'public': false
  },
  'Product': {
    'dataSource': 'vagrant-postgres',
    'public': true,
    '$promise': {},
    '$resolved': true
  },
  'Review': {
    'dataSource': 'vagrant-postgres',
    'public': true,
    '$promise': {},
    '$resolved': true
  },
  'Reviewer': {
    'dataSource': 'vagrant-postgres',
    'public': true,
    '$promise': {},
    '$resolved': true
  },
  'Vote': {
    'dataSource': 'vagrant-postgres',
    'public': true
  }
}
