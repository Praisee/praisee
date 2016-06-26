import {expect} from 'chai';
import supertest from 'supertest';
import createServerTest from 'pz-server/test/support/create-server-test';

createServerTest('server', function () {
    it('starts', () => {});
    
    it('serves site routes', (done) => {
        (supertest(this.app)
            .get('/')
            .expect(200, done)
        );
    });
    
    it('serves static assets', (done) => {
        (supertest(this.app)
            .get('/i/client/scripts/index.js')
            .expect(200, done)
        );
    });

    it('has an accessible API', (done) => {
        (supertest(this.app)
            .get('/i/api/Topics')
            .expect(200, done)
        );
    });
    
    it('has an accessible GraphQL API', (done) => {
        (supertest(this.app)
            .get('/i/graphql')
            .accept('html')
            .expect(200, done)
        );
    });
});
