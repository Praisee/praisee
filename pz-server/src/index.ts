import PzServer from 'pz-server/src/server';

process.on('unhandledRejection', (error, promise) => {
    console.error('Unhandled promise rejection: ', error);
    throw error;
});

if (process.env.NODE_ENV !== 'production') {
    require('source-map-support').install();
    require('longjohn').async_trace_limit = 30;
}

const server = new PzServer();
server.start();
