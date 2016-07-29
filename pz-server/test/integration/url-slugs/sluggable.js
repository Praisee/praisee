import {expect} from 'chai';
import supertest from 'supertest-as-promised';
import promisify from 'pz-support/src/promisify';
import createServerTestFor from 'pz-server/test/support/create-server-test';
import createSlug from 'pz-server/src/url-slugs/slugger';

createServerTestFor('sluggable', function () {
    const context = this;

    describe('given a sluggable', () => {
        let Review, UrlSlug, review;

        beforeEach(async () => {
            Review = context.models.Review;
            UrlSlug = context.models.UrlSlug;

            Review.sluggerOptions = Object.assign(
                {}, Review.sluggerOptions, { minChars: 1 }
            );

            UrlSlug.daysBeforeAliasCanBeCreated = 0;

            await resetModels();
            await create('Foo');
        });

        afterEach(async () => {
            await resetModels();
        });

        it('can find a sluggable by a url slug ', async () => {
            let sluggable = await Review.getByUrlSlugName("FOO");
            expect(sluggable).to.not.be.null;
            expect(sluggable.summary).to.equal("Foo");
        });

        async function resetModels() {
            await promisify(Review.destroyAll, Review)();
            await promisify(UrlSlug.destroyAll, UrlSlug)();
        }

        async function create(name) {
            await supertest(context.app)
                .post('/i/api/Reviews')
                .send({
                    'summary': name,
                    'body': Math.random().toString()
                })
                .expect(200);
        }
    });
});
