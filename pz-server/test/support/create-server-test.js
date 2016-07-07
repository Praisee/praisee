import PzServer from 'pz-server/src/server';
import mute from 'mute';

let server = null;

export default function createServerTest(description, callback, bootConfig = void(0)) {
    describe(description, function () {
        process.on('unhandledRejection', (error, promise) => {
            console.error('Unhandled promise rejection: ', error);
            throw error;
        });
        
        this.timeout(10000);

        callback.server = null;
        callback.app = null;
        callback.models = {};

        before((done) => {
            // Unfortunately, Loopback doesn't support shutdown events, so between
            // one test ending and another starting, the server may still be running
            // leaving behind its side effects. As an alternative solution, we will
            // create a persistent server across all tests.
            // TODO: Create a fresh server when Loopback supports shutdown events
            if (server) {
                callback.server = server;
                callback.app = server.app;
                callback.models = server.app.models;
                return done();
            }

            const unmute = mute();
            
            server = new PzServer(bootConfig);

            callback.server = server;
            callback.app = callback.server.app;

            callback.server.start();

            callback.app.on('started', () => {
                unmute();
                
                callback.models = callback.app.models;
                
                done();
            });
        });
        
        callback.call(callback);
    });
}
