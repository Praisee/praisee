import PzServer from 'pz-server/src/server';

process.on('unhandledRejection', (error, promise) => {
    console.error('Unhandled promise rejection: ', error);
    throw error;
});

if (process.env.NODE_ENV !== 'production') {
    require('source-map-support').install();
}

const server = new PzServer();
server.start();
