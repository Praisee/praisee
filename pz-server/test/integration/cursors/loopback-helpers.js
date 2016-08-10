import chai, {expect} from 'chai';
import loopback from 'loopback';
import promisify from 'pz-support/src/promisify';
import createServerTestFor from 'pz-server/test/support/create-server-test';
import {findWithCursor} from 'pz-server/src/support/cursors/loopback-helpers';

require('source-map-support').install();
require('longjohn').async_trace_limit = 30;
chai.config.includeStack = true;

createServerTestFor('Loopback cursor helpers', function () {
    const context = this;

    let TestModel;

    let testModels, model1, model2, model3, model4, model5, model6;

    before(setupSampleData);

    it('finds some items over a cursor', async () => {
        return await testModelOrder({
            models: [model1, model2, model3, model4, model5, model6]
        });
    });

    it('applies a number comparison for number fields', async () => {
        return await testModelOrder({
            filter: {order: 'numberTest'},
            models: [model3, model2, model1, model6, model5, model4]
        });
    });

    it('applies a number comparison for number fields (desc)', async () => {
        return await testModelOrder({
            filter: {order: 'numberTest DESC'},
            models: [model3, model2, model1, model6, model5, model4].reverse()
        });
    });

    it('applies an alphabetical comparison for string fields', async () => {
        return await testModelOrder({
            filter: {order: 'stringTest'},
            models: [model6, model5, model4, model3, model2, model1]
        });
    });

    it('applies an alphabetical comparison for string fields (desc)', async () => {
        return await testModelOrder({
            filter: {order: 'stringTest DESC'},
            models: [model6, model5, model4, model3, model2, model1].reverse()
        });
    });

    it('applies a date comparison for date fields', async () => {
        return await testModelOrder({
            filter: {order: 'createdAt'},
            models: [model1, model2, model3, model4, model5, model6]
        });
    });

    it('applies a date comparison for date fields (desc)', async () => {
        return await testModelOrder({
            filter: {order: 'createdAt DESC'},
            models: [model1, model2, model3, model4, model5, model6].reverse()
        });
    });

    // TODO: Provide a mechanism to allow for custom comparisons
    // it('can apply a custom comparison');

    async function testModelOrder({filter, models}) {
        let [model1, model2, model3, model4, model5, model6] = models;

        // Traverse forward
        const first2 = await take({first: 2, filter});
        expectResultsToMatchModels(first2, [model1, model2]);
        expectPagination(first2, {nextPage: true, previousPage: false});

        const next2 = await take({first: 2, previousResults: first2, filter});
        expectResultsToMatchModels(next2, [model3, model4]);
        expectPagination(next2, {nextPage: true, previousPage: false});

        const ending2 = await take({first: 2, previousResults: next2, filter});
        expectResultsToMatchModels(ending2, [model5, model6]);
        expectPagination(ending2, {nextPage: false, previousPage: false});

        // Traverse backward
        const last2 = await take({last: 2, filter});
        expectResultsToMatchModels(last2, [model5, model6]);
        expectPagination(last2, {nextPage: false, previousPage: true});

        const prior2 = await take({last: 2, previousResults: last2, filter});
        expectResultsToMatchModels(prior2, [model3, model4]);
        expectPagination(prior2, {nextPage: false, previousPage: true});

        const beginning2 = await take({last: 2, previousResults: prior2, filter});
        expectResultsToMatchModels(beginning2, [model1, model2]);
        expectPagination(beginning2, {nextPage: false, previousPage: false});

        // Note: nextPage and previousPage are always false in some circumstances
        // due to the Connections spec. See:
        // https://github.com/graphql/graphql-relay-js/issues/58
    }

    async function setupSampleData() {
        TestModel = loopback.createModel({
            name: 'TestModel',
            base: 'PersistedModel',
            properties: {
                'stringTest': { type: 'string' },
                'numberTest': { type: 'number' },
                'createdAt': { type: 'Date' }
            }
        });

        context.app.model(TestModel, {
            dataSource: loopback.memory()
        });

        const now = new Date();
        model1 = new TestModel({stringTest: 'F', numberTest: 3, createdAt: addDays(now, 1)});
        model2 = new TestModel({stringTest: 'E', numberTest: 2, createdAt: addDays(now, 2)});
        model3 = new TestModel({stringTest: 'D', numberTest: 1, createdAt: addDays(now, 3)});
        model4 = new TestModel({stringTest: 'C', numberTest: 6, createdAt: addDays(now, 4)});
        model5 = new TestModel({stringTest: 'B', numberTest: 5, createdAt: addDays(now, 5)});
        model6 = new TestModel({stringTest: 'A', numberTest: 4, createdAt: addDays(now, 6)});

        testModels = [model1, model2, model3, model4, model5, model6];

        await populateWith(testModels);
    }

    async function populateWith(models) {
        return await Promise.all(models.map(model => promisify(model.save, model)()));
    }

    async function take({first, last, previousResults, filter}) {
        if (!previousResults) {
            if (first) {
                return await findWithCursor(TestModel, {takeFirst: first}, filter);
            } else {
                return await findWithCursor(TestModel, {takeLast: last}, filter);
            }
        }

        if (first) {
            const lastResult = previousResults.results[previousResults.results.length - 1];

            return await findWithCursor(
                TestModel,
                {skipAfter: lastResult.cursor, takeFirst: first},
                filter
            );
        } else {
            const firstResult = previousResults.results[0];

            return await findWithCursor(
                TestModel,
                {skipBefore: firstResult.cursor, takeLast: last},
                filter
            );
        }
    }

    function modelsFrom(cursorResults) {
        return cursorResults.results.map(result => result.item);
    }

    function toValue(complexObject) {
        const objectString = JSON.stringify(complexObject);

        if (!objectString) {
            return null;
        }

        return JSON.parse(objectString);
    }

    function addDays(date, days) {
        var newDate = new Date(date.valueOf());
        newDate.setDate(newDate.getDate() + days);
        return newDate;
    }

    function expectResultsToMatchModels(results, models) {
        expect(toValue(modelsFrom(results))).to.deep.equal(toValue(models));
    }

    function expectPagination(results, {nextPage, previousPage}) {
        if (nextPage) {
            expect(results.hasNextPage).to.be.true;
        } else {
            expect(results.hasNextPage).to.be.false;
        }

        if (previousPage) {
            expect(results.hasPreviousPage).to.be.true;
        } else {
            expect(results.hasPreviousPage).to.be.false;
        }
    }
});
