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
    'dataSource': 'db',
    'public': false
  },
  'AccessToken': {
    'dataSource': 'db',
    'public': false
  },
  'ACL': {
    'dataSource': 'db',
    'public': false
  },
  'RoleMapping': {
    'dataSource': 'db',
    'public': false
  },
  'Role': {
    'dataSource': 'db',
    'public': false
  },
  'Product': {
    'dataSource': 'heroku-postgres',
    'public': true,
    '$promise': {},
    '$resolved': true
  },
  'Review': {
    'dataSource': 'heroku-postgres',
    'public': true,
    '$promise': {},
    '$resolved': true
  },
  'Reviewer': {
    'dataSource': 'heroku-postgres',
    'public': true,
    '$promise': {},
    '$resolved': true
  },
  'Vote': {
    'dataSource': 'heroku-postgres',
    'public': true
  }
}
