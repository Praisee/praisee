import PzServer from 'pz-server/src/server';

process.on('unhandledRejection', (error, promise) => {
    console.error('Unhandled promise rejection: ', error);
    throw error;
});

const server = new PzServer();
server.start();
