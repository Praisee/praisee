import importJson from 'pz-support/src/import-json';
import {registerWorkers as registerTopicCommunityItemsWorkers} from 'pz-server/src/rankings/topic-community-items';
import {AmqpWorkerServer, AmqpWorkerClient} from 'pz-server/src/support/worker';

module.exports = function initializeWorkers(app: IApp, next: ICallback) {
    console.log('Starting worker server');

    const rabbitmqConfig = importJson('pz-server/src/app/rabbitmq-config.json');

    let workerServer = new AmqpWorkerServer(rabbitmqConfig.server.url);
    let workerClient = new AmqpWorkerClient(rabbitmqConfig.server.url);

    registerTopicCommunityItemsWorkers(workerServer, workerClient, app.services.repositories);

    (Promise.all([
            workerClient.connect(),
            workerServer.start()
        ])
        .then(() => next(null))
        .catch((error) => next(error))
    );

    workerServer.start();

    app.services.workerClient = workerClient;
};
