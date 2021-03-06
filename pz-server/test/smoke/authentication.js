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
        User = context.models.PraiseeUser;

        requestWithSession = supertestSession(context.app);

        await resetModels(this.models);
    });

    afterEach(async () => {
        await resetModels(this.models);
    });

    it('can register', async () => {
        await registerUser('foobar@example.com', 'foobar');

        const user = await promisify(User.findOne, User)({
            where: { email: 'foobar@example.com' }
        });

        expect(user.email).to.equal('foobar@example.com');
    });

    it('can authenticate', async () => {
        await registerUser('foobar@example.com', 'foobar');
        const response = await authenticateUser('foobar@example.com', 'foobar');

        expect(response.body.success).to.equal(true);
    });

    describe('as a visitor', () => {
        it('does not give a user', async () => {
            const currentUser = await lookupUser();
            expect(currentUser).to.be.null;
        });
    });

    describe('as a user', () => {
        it('gives me my user info', async () => {
            await registerUser('foobar@example.com', 'foobar');
            await authenticateUser('foobar@example.com', 'foobar');
            const currentUser = await lookupUser();

            expect(currentUser.email).to.equal('foobar@example.com');
        });
    });

    async function registerUser(email, password) {
        await requestWithSession
            .post('/i/api/PraiseeUsers')
            .send({
                'email': email,
                'displayName': email,
                'password': password
            })
            .expect(200);
    }

    async function authenticateUser(email, password) {
        return await requestWithSession
            .post('/i/login')
            .send({
                'email': email,
                'password': password
            })
            .expect(200);
    }

    async function lookupUser() {
        const response = await requestWithSession
            .post('/i/graphql')
            .send({
                query: `
                    query {
                        currentUser {
                            email
                        }
                    }
                `
            })
            .expect(200);

        return response.body.data.currentUser;
    }
});
