import promisify from 'pz-support/src/promisify';
import bootConfig from 'pz-domain/src/remote-app/boot-config';

var loopback = require('loopback');
var loopbackBoot = require('loopback-boot');

export default function createApp(): Promise<IApp> {
    let app = loopback();
    return promisify(loopbackBoot)(app, bootConfig).then(() => app);
}
