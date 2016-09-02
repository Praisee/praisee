import importJson from 'pz-support/src/import-json';
import {AmqpWorkerClient} from 'pz-server/src/support/worker';

module.exports = function initializeCache(app: IApp, next: ICallback) {
    const rabbitmqConfig = importJson('pz-server/src/app/rabbitmq-config.json');

    let workerClient = new AmqpWorkerClient(rabbitmqConfig.server.url);

    (workerClient
        .connect()
        .then(() => next(null))
        .catch((error) => next(error))
    );

    app.services.workerClient = workerClient;
};
