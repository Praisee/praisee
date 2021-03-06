import pzPath from 'pz-support/src/pz-path';

var loopback = require('loopback');

module.exports = function staticAssetsServer(app: IApp) {
    app.middleware(
        'files',
        '/i/client',
        loopback.static(pzPath('pz-client', 'public'))
    );
};
