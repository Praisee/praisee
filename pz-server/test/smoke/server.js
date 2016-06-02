import {expect} from 'chai';
import supertest from 'supertest';
import createServerTest from 'pz-server/test/support/create-server-test';

createServerTest('server', function () {
    it('starts', () => {});
    
    it('has an accessible API', (done) => {
        (supertest(this.app)
            .get('/i/api/Topics')
            .expect(200, done)
        );
    });
    
    it('serves site routes', (done) => {
        (supertest(this.app)
            .get('/')
            .expect(200, done)
        );
    });
});
