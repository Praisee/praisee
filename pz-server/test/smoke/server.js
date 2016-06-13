import {expect} from 'chai';
import supertest from 'supertest';
import PzServer from 'pz-server/src/server';
import mute from 'mute';

describe('server', function () {
    this.timeout(60000);
    
    let server;
    let app;
    
    before((done) => {
        const unmute = mute();
        
        server = new PzServer();
        app = server.app;

        server.start();

        app.on('started', () => {
            unmute();
            done();
        });
    });
    
    after(() => {
        server.stop();
    });
    
    it('starts', () => {});
    
    it('has an accessible API', (done) => {
        (supertest(app)
            .get('/i/api/Topics')
            .expect(200, done)
        );
    });
    
    it('serves site routes', (done) => {
        (supertest(app)
            .get('/')
            .expect(200, done)
        );
    });
});
