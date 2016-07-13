import promisify from 'pz-support/src/promisify';
import {expect} from 'chai';
import supertest from 'supertest';
import createServerTestFor from 'pz-server/test/support/create-server-test';
import resetModels from 'pz-server/test/support/reset-models';
import searchSchema from 'pz-server/src/search/schema';

// Elasticsearch needs some time to process updates, so this helps fixes that.
const pauseBetweenUpdates = 0.1;

createServerTestFor('search', function () {
    let Topic, Review, searchUpdater, searchClient;

    before(async () => {
        Topic = this.models.Topic;
        Review = this.models.Review;
        searchUpdater = this.app.services.searchUpdater;
        searchClient = this.app.services.searchClient;

        searchUpdater.stop();
    });

    beforeEach(async () => {
        searchClient.resetIndexFromSchema(searchSchema);

        await pauseForUpdates();

        searchUpdater.removeSearchUpdateObservers();

        await resetModels(this.models);

        searchUpdater.addSearchUpdateObservers();
    });

    after(async () => {
        searchUpdater.removeSearchUpdateObservers();

        await resetModels(this.models);

        searchUpdater.start();
    });

    it('creates search entries', async () => {
        const [topic1, topic2, review1] = await Promise.all([
            createTopic(), createTopic(), createReview()
        ]);

        await searchUpdater.runJobs();

        const [search1, search2, search3] = await Promise.all([
            lookupTopic(topic1), lookupTopic(topic2), lookupReview(review1)
        ]);

        expect(search1._source.name).to.equal(topic1.name);
        expect(search2._source.name).to.equal(topic2.name);
        expect(search3._source.summary).to.equal(review1.summary);
    });

    it('merges search entry updates', async () => {
        let topic1 = await createTopic();

        topic1 = await renameTopic(topic1);

        await searchUpdater.runJobs();

        const search1 = await lookupTopic(topic1);

        expect(search1._source.name).to.equal(topic1.name);
    });

    describe('given a new item', function() {
        let topic;

        beforeEach(async () => {
            topic = await createTopic();
        });

        it('can delete the item', async () => {
            await promisify(topic.destroy, topic)();
            await searchUpdater.runJobs();
            const search = await lookupTopic(topic);
            expect(search).to.be.null;
        });
    });

    describe('given an existing item', function() {
        let topic;

        beforeEach(async () => {
            topic = await createTopic();
            await searchUpdater.runJobs();
        });

        it('can delete the item', async () => {
            await promisify(topic.destroy, topic)();
            await searchUpdater.runJobs();
            const search = await lookupTopic(topic);
            expect(search).to.be.null;
        });

        it('can update the item', async () => {
            topic = await renameTopic(topic);
            await searchUpdater.runJobs();
            const search = await lookupTopic(topic);
            expect(search._source.name).to.equal(topic.name);
        });
    });

    it('handles lots of changes likes a champ', async () => {
        const changes1 = await createBulkChanges();
        await pauseForUpdates();
        await expectBulkChangesToBeInSearchEngine(changes1);

        const changes2 = await createBulkChanges(changes1);
        await pauseForUpdates();
        await expectBulkChangesToBeInSearchEngine(changes2);
    });

    async function createTopic() {
        const name = 'Searchable Test Topic ' + Math.random();
        const topic = new Topic({name, isVerified: true});
        await promisify(topic.save, topic)();
        return topic;
    }

    async function createReview() {
        const summary = 'Searchable Test Review ' + Math.random();
        const review = new Review({summary, body: summary});
        await promisify(review.save, review)();
        return review;
    }

    async function renameTopic(topic) {
        topic.name = 'Updated Searchable Test Topic ' + Math.random();
        await promisify(topic.save, topic)();
        return await promisify(Topic.findById, Topic)(topic.id);
    }

    async function renameReview(review) {
        review.name = 'Updated Searchable Test Review ' + Math.random();
        await promisify(review.save, review)();
        return await promisify(Review.findById, Review)(review.id);
    }

    async function lookupTopic(topic) {
        return await searchClient.getDocument({
            index: searchSchema.index,
            type: searchSchema.types.topic,
            id: topic.id
        });
    }

    async function lookupReview(review) {
        return await searchClient.getDocument({
            index: searchSchema.index,
            type: searchSchema.types.communityItem,
            id: review.id
        });
    }

    async function createBulkChanges(fromPriorChanges = []) {
        const numberOfChanges = 30;
        let changes = fromPriorChanges.slice();

        for (let i = numberOfChanges; i--;) {
            const randomNumber = Math.random();

            if (!changes.length || randomNumber >= 0.5) {
                // Randomly create

                if (Math.random() >= 0.5) {
                    changes.push({action: 'create', type: 'topic', item: await createTopic()});
                } else {
                    changes.push({action: 'create', type: 'review', item: await createReview()});
                }

            } else if (randomNumber <= 0.25) {
                // Randomly rename

                const [change] = changes.splice(Math.floor(Math.random() * changes.length), 1);

                if (change.action === 'remove') {
                    ++i;
                    continue;
                }

                const item = change.type === 'topic' ?
                    await renameTopic(change.item) : await renameReview(change.item);

                changes.push({action: 'rename', type: change.type, item});

            } else {
                // Randomly remove

                const [change] = changes.splice(Math.floor(Math.random() * changes.length), 1);

                if (change.action === 'remove') {
                    ++i;
                    continue;
                }

                const item = change.item;
                await promisify(item.destroy, item)();

                changes.push({action: 'remove', type: change.type, item});
            }
        }

        await searchUpdater.runJobs();

        return changes;
    }

    async function expectBulkChangesToBeInSearchEngine(changes) {
        let search;
        
        for (let change of changes) {
            switch (change.action) {
                case 'create':
                case 'rename':
                    if (change.type === 'topic') {
                        search = await lookupTopic(change.item);
                        expect(search._source.name).to.equal(change.item.name);
                    } else {
                        search = await lookupReview(change.item);
                        expect(search._source.summary).to.equal(change.item.summary);
                    }
                    break;
                
                case 'remove':
                default:
                    if (change.type === 'topic') {
                        search = await lookupTopic(change.item);
                    } else {
                        search = await lookupReview(change.item);
                    }

                    expect(search).to.be.null;
                    break;
            }
        }
    }

    async function pauseForUpdates() {
        await new Promise(resolve => {
            setTimeout(resolve, 1000 * pauseBetweenUpdates);
        });
    }
});
