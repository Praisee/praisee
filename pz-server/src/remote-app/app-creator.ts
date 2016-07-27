import promisify from 'pz-support/src/promisify';
import bootConfig from 'pz-server/src/remote-app/boot-config';

var loopback = require('loopback');
var loopbackBoot = require('loopback-boot');

export default function createApp(): Promise<IApp> {
    // We need to create a copy of this object because Loopback mutates it :/
    const clonedBootConfig = JSON.parse(JSON.stringify(bootConfig));

    let app = loopback({localRegistry: true, loadBuiltinModels: true});

    app.services = {};

    return promisify(loopbackBoot)(app, clonedBootConfig).then(() => app);
}
