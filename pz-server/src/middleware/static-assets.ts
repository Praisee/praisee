import pzPath from 'pz-support/src/pz-path';

var loopback = require('loopback');

export default function staticAssetsServer(app) {
    app.middleware(
        'files',
        '/client',
        loopback.static(pzPath('pz-client', 'public'))
    );
}
