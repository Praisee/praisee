import {expect} from 'chai';
import supertest from 'supertest-as-promised';
import promisify from 'pz-support/src/promisify';
import createServerTestFor from 'pz-server/test/support/create-server-test';
import createSlug from 'pz-server/src/url-slugs/slugger';
import resetModels from 'pz-server/test/support/reset-models';

createServerTestFor('urlSlugs', function () {
    const context = this;
    
    describe('given a sluggable', () => {
        let Review, UrlSlug, review;
        
        beforeEach(async () => {
            Review = context.models.Review;
            UrlSlug = context.models.UrlSlug;
            
            Review.sluggerOptions = Object.assign(
                {}, Review.sluggerOptions, {minChars: 1}
            );
            
            UrlSlug.daysBeforeAliasCanBeCreated = 0;

            await resetModels(this.models);
            await create('Foo');
            review = await findFoo();
        });
        
        afterEach(async () => {
            await resetModels(this.models);
        });
        
        it('creates a URL slug', async () => {
            expect(review.UrlSlug()).to.have.lengthOf(1);
            expect(review.UrlSlug()[0].fullSlug).to.equal(urlSlug('Foo'));
        });

        it('updates URL slugs when an existing sluggable is updated', async () => {
            await renameFooTo('Bar');
            
            let urlSlugs = await findUrlSlugs();
            
            urlSlugs = urlSlugs.map(urlSlug => urlSlug.fullSlug);
            
            expect(urlSlugs).to.have.length.above(0);
            expect(urlSlugs).to.include(urlSlug('Bar'));
        });
        
        it('creates aliases when an existing sluggable is updated', async () => {
            await renameFooTo('Bar');

            let urlSlugs = await findUrlSlugs();
            let aliasUrlSlug = urlSlugs.find(urlSlug => urlSlug.isAlias);

            expect(urlSlugs).to.have.lengthOf(2);
            expect(aliasUrlSlug.fullSlug).to.equal(urlSlug('Foo'));
            
            await renameFooTo('Baz');

            urlSlugs = await findUrlSlugs();
            
            let aliasUrlSlugs = urlSlugs
                .filter(urlSlug => urlSlug.isAlias)
                .map(urlSlug => urlSlug.fullSlug);

            expect(urlSlugs).to.have.lengthOf(3);
            expect(aliasUrlSlugs).to.eql([urlSlug('Foo'), urlSlug('Bar')]);
        });
        
        it('does nothing when the sluggable value has not changed', async () => {
            await renameFooTo('Foo');
            
            let urlSlugs = await findUrlSlugs();

            expect(urlSlugs).to.have.lengthOf(1);
            expect(urlSlugs[0].fullSlug).to.equal(urlSlug('Foo'));
        });
        
        it('swaps aliases when reverting to an old sluggable value', async () => {
            await renameFooTo('Bar');
            await renameFooTo('Foo');

            let urlSlugs = await findUrlSlugs();

            let primarySlug = urlSlugs.find(urlSlug => !urlSlug.isAlias);

            let aliasUrlSlugs = urlSlugs
                .filter(urlSlug => urlSlug.isAlias)
                .map(urlSlug => urlSlug.fullSlug);

            expect(urlSlugs).to.have.lengthOf(2);
            expect(primarySlug.fullSlug).to.equal(urlSlug('Foo'));
            expect(aliasUrlSlugs).to.eql([urlSlug('Bar')]);
        });
        
        it('swaps aliases when reverting to an old sluggable value (2)', async () => {
            await renameFooTo('Bar');
            await renameFooTo('Baz');
            await renameFooTo('Foo');
            
            let urlSlugs = await findUrlSlugs();
            
            let primarySlug = urlSlugs.find(urlSlug => !urlSlug.isAlias);
            
            let aliasUrlSlugs = urlSlugs
                .filter(urlSlug => urlSlug.isAlias)
                .map(urlSlug => urlSlug.fullSlug);
        
            expect(urlSlugs).to.have.lengthOf(3);
            expect(primarySlug.fullSlug).to.equal(urlSlug('Foo'));
            expect(aliasUrlSlugs).to.eql([urlSlug('Bar'), urlSlug('Baz')]);
        });
        
        it('does not create more than 2 aliases', async () => {
            await renameFooTo('Bar');
            await renameFooTo('Baz');
            await renameFooTo('Fee');
            await renameFooTo('Nix');
            
            let urlSlugs = await findUrlSlugs();
            
            let aliasUrlSlugs = urlSlugs
                .filter(urlSlug => urlSlug.isAlias)
                .map(urlSlug => urlSlug.fullSlug);
            
            expect(urlSlugs).to.have.lengthOf(3);
            expect(aliasUrlSlugs).to.eql([urlSlug('Baz'), urlSlug('Fee')]);
        });
        
        it('handles collisions', async () => {
            await create('Foo');
            await create('Foo');
            
            let allUrlSlugs = await promisify(UrlSlug.find, UrlSlug)();
            
            allUrlSlugs = allUrlSlugs.map(urlSlug => urlSlug.fullSlug);
            
            expect(allUrlSlugs).to.have.lengthOf(3);
            
            expect(allUrlSlugs).to.eql([
                urlSlug('Foo'), urlSlug('Foo', 1), urlSlug('Foo', 2)
            ]);
        });
        
        function urlSlug(fromText, duplicateOffset = 0) {
            return createSlug(fromText, {
                duplicateOffset,
                minChars: 1
            });
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
        
        async function findFoo() {
            return await promisify(Review.findOne, Review)({
                where: { summary: 'Foo' },
                include: 'UrlSlug'
            });
        }
        
        async function renameFooTo(to) {
            await supertest(context.app)
                .put('/i/api/Reviews/' + review.id)
                .send({
                    'summary': to,
                    'body': Math.random().toString()
                })
                .expect(200);
        }

        async function findUrlSlugs() {
            const updatedReview = await promisify(Review.findOne, Review)({
                where: { id: review.id },
                include: 'UrlSlug'
            });

            return updatedReview.UrlSlug();
        }
    });
});
