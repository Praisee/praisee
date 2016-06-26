import PzServer from 'pz-server/src/server';
import mute from 'mute';

export default function createServerTest(description, callback, bootConfig = void(0)) {
    describe(description, function () {
        process.on('unhandledRejection', (error, promise) => {
            console.error('Unhandled promise rejection: ', error);
            throw error;
        });
        
        this.timeout(60000);

        callback.server = null;
        callback.app = null;
        callback.models = {};

        before((done) => {
            const unmute = mute();

            callback.server = new PzServer(bootConfig);
            callback.app = callback.server.app;

            callback.server.start();

            callback.app.on('started', () => {
                unmute();
                
                callback.models = callback.app.models;
                
                done();
            });
        });

        after(() => {
            callback.server.stop();
        });
        
        callback.call(callback);
    });
}
