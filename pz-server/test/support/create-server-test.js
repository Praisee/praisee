import PzServer from 'pz-server/src/server';
import mute from 'mute';

export default function createServerTest(description, callback) {
    describe(description, function () {
        this.timeout(60000);

        callback.server = null;
        callback.app = null;
        callback.models = {};

        before((done) => {
            const unmute = mute();

            callback.server = new PzServer();
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
