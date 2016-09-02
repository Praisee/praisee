import promisify from 'pz-support/src/promisify';
import bootConfig from 'pz-server/src/rankings/worker-app/boot-config';

process.on('unhandledRejection', (error, promise) => {
    console.error('Unhandled promise rejection: ', error);
    throw error;
});

if (process.env.NODE_ENV !== 'production') {
    require('source-map-support').install();
    require('longjohn').async_trace_limit = 30;
}

var loopback = require('loopback');
var loopbackBoot = require('loopback-boot');

var app: IApp = loopback({
    // Force local Registry, so we don't have collisions with other instances
    localRegistry: true,
    loadBuiltinModels: true
});

app.services = {};

let hasBooted = false;

function boot() {
    return (promisify(loopbackBoot)(app, bootConfig)
        .then(() => {
            hasBooted = true;
        })
        .catch(error => {
            console.error('Boot failed', error);
            throw error;
        })
    );
}

boot();
