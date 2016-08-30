import {registerWorkers as registerTopicCommunityItemsWorkers} from 'pz-server/src/ranking/topic-community-items';
import {AmqpWorkerServer, AmqpWorkerClient} from 'pz-server/src/support/worker';

module.exports = function initializeWorkers(app: IApp) {
    console.log('Starting worker server');

    let workerServer = new AmqpWorkerServer('amqp://dev:dev@localhost');
    let workerClient = new AmqpWorkerClient('amqp://dev:dev@localhost');

    workerClient.connect();

    registerTopicCommunityItemsWorkers(workerServer, workerClient, app.services.repositories);

    workerServer.start();
};
