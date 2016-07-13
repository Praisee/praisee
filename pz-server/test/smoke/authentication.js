import {expect} from 'chai';
import supertest from 'supertest-as-promised';
import supertestSession from 'supertest-session';
import promisify from 'pz-support/src/promisify';
import createServerTestFor from 'pz-server/test/support/create-server-test';
import resetModels from 'pz-server/test/support/reset-models';

createServerTestFor('authentication', function () {
    const context = this;
    let User, requestWithSession;
    
    beforeEach(async () => {
        User = context.models.User;
        
        requestWithSession = supertestSession(context.app);
        
        await resetModels(this.models);
    });

    afterEach(async () => {
        await resetModels(this.models);
    });
    
    it('can register', async () => {
        await registerUser('foobar', 'foobar');
        
        const user = await promisify(User.findOne, User)({
            where: { username: 'foobar' }
        });
        
        expect(user.username).to.equal('foobar');
    });

    it('can authenticate', async () => {
        await registerUser('foobar', 'foobar');
        const response = await authenticateUser('foobar', 'foobar');
        
        expect(response.body.success).to.equal(true);
    });
    
    describe('as a visitor', () => {
        it('does not give a user', async () => {
            const response = await lookupUser();
            const currentUser = response.body.data.viewer.currentUser;
            expect(currentUser).to.be.null;
        });
    });
    
    describe('as a user', () => {
        it('gives me my user info', async () => {
            await registerUser('foobar', 'foobar');
            await authenticateUser('foobar', 'foobar');
            const response = await lookupUser();
            const currentUser = response.body.data.viewer.currentUser;
            
            expect(currentUser.username).to.equal('foobar');
        });
    });
    
    async function registerUser(username, password) {
        await requestWithSession
            .post('/i/api/Users')
            .send({
                'username': username,
                'email': username + '@example.com',
                'password': password
            })
            .expect(200);
    }
    
    async function authenticateUser(username, password) {
        return await requestWithSession
            .post('/i/login')
            .send({
                'username': username,
                'password': password
            })
            .expect(200);
    }
    
    async function lookupUser() {
        return await requestWithSession
            .post('/i/graphql')
            .send({
                query: `
                    query {
                        viewer {
                            currentUser {
                                username
                            }
                        }
                    }
                `
            })
            .expect(200);
    }
});
