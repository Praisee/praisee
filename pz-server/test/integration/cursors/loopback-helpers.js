import {expect} from 'chai';
import loopback from 'loopback';
import promisify from 'pz-support/src/promisify';
import createServerTestFor from 'pz-server/test/support/create-server-test';
import {findWithCursor} from 'pz-server/src/support/cursors/loopback-helpers';

createServerTestFor('Loopback cursor helpers', function () {
    const context = this;

    let TestModel;

    let testModels, model1, model2, model3, model4, model5, model6;

    before(setupSampleData);

    it('finds some items over a cursor', async () => {
        const first3 = await take({next: 3});
        expectResultsToMatchModels(first3, [model1, model2, model3]);
        expectPagination(first3, {nextPage: true, previousPage: false});

        const next3 = await take({next: 3, previousResults: first3});
        expectResultsToMatchModels(next3, [model4, model5, model6]);
        expectPagination(next3, {nextPage: false, previousPage: true});

        const prior3 = await take({previous: 3, previousResults: next3});
        expectResultsToMatchModels(prior3, [model1, model2, model3]);
        expectPagination(prior3, {nextPage: true, previousPage: false});
    });

    it('applies a number comparison for number fields', async () => {
        const first3 = await take({next: 3, filter: {order: 'numberTest'}});
        expectResultsToMatchModels(first3, [model3, model2, model1]);
        expectPagination(first3, {nextPage: true, previousPage: false});

        const next3 = await take({next: 3, previousResults: first3, filter: {order: 'numberTest'}});
        expectResultsToMatchModels(next3, [model6, model5, model4]);
        expectPagination(next3, {nextPage: false, previousPage: true});

        const prior3 = await take({previous: 3, previousResults: next3, filter: {order: 'numberTest'}});
        expectResultsToMatchModels(prior3, [model3, model2, model1]);
        expectPagination(prior3, {nextPage: true, previousPage: false});
    });

    it('applies a number comparison for number fields (desc)', async () => {
        const first3 = await take({next: 3, filter: {order: 'numberTest DESC'}});
        expectResultsToMatchModels(first3, [model4, model5, model6]);
        expectPagination(first3, {nextPage: true, previousPage: false});

        const next3 = await take({next: 3, previousResults: first3, filter: {order: 'numberTest DESC'}});
        expectResultsToMatchModels(next3, [model1, model2, model3]);
        expectPagination(next3, {nextPage: false, previousPage: true});

        const prior3 = await take({previous: 3, previousResults: next3, filter: {order: 'numberTest DESC'}});
        expectResultsToMatchModels(prior3, [model4, model5, model6]);
        expectPagination(prior3, {nextPage: true, previousPage: false});
    });

    it('applies an alphabetical comparison for string fields', async () => {
        const first3 = await take({next: 3, filter: {order: 'stringTest'}});
        expectResultsToMatchModels(first3, [model6, model5, model4]);
        expectPagination(first3, {nextPage: true, previousPage: false});

        const next3 = await take({next: 3, previousResults: first3, filter: {order: 'stringTest'}});
        expectResultsToMatchModels(next3, [model3, model2, model1]);
        expectPagination(next3, {nextPage: false, previousPage: true});

        const prior3 = await take({previous: 3, previousResults: next3, filter: {order: 'stringTest'}});
        expectResultsToMatchModels(prior3, [model6, model5, model4]);
        expectPagination(prior3, {nextPage: true, previousPage: false});
    });

    it('applies an alphabetical comparison for string fields (desc)', async () => {
        const first3 = await take({next: 3, filter: {order: 'stringTest DESC'}});
        expectResultsToMatchModels(first3, [model1, model2, model3]);
        expectPagination(first3, {nextPage: true, previousPage: false});

        const next3 = await take({next: 3, previousResults: first3, filter: {order: 'stringTest DESC'}});
        expectResultsToMatchModels(next3, [model4, model5, model6]);
        expectPagination(next3, {nextPage: false, previousPage: true});

        const prior3 = await take({previous: 3, previousResults: next3, filter: {order: 'stringTest DESC'}});
        expectResultsToMatchModels(prior3, [model1, model2, model3]);
        expectPagination(prior3, {nextPage: true, previousPage: false});
    });

    it('applies a date comparison for date fields', async () => {
        const first3 = await take({next: 3, filter: {order: 'createdAt'}});
        expectResultsToMatchModels(first3, [model1, model2, model3]);
        expectPagination(first3, {nextPage: true, previousPage: false});

        const next3 = await take({next: 3, previousResults: first3, filter: {order: 'createdAt'}});
        expectResultsToMatchModels(next3, [model4, model5, model6]);
        expectPagination(next3, {nextPage: false, previousPage: true});

        const prior3 = await take({previous: 3, previousResults: next3, filter: {order: 'createdAt'}});
        expectResultsToMatchModels(prior3, [model1, model2, model3]);
        expectPagination(prior3, {nextPage: true, previousPage: false});
    });

    it('applies a date comparison for date fields (desc)', async () => {
        const first3 = await take({next: 3, filter: {order: 'createdAt DESC'}});
        expectResultsToMatchModels(first3, [model6, model5, model4]);
        expectPagination(first3, {nextPage: true, previousPage: false});

        const next3 = await take({next: 3, previousResults: first3, filter: {order: 'createdAt DESC'}});
        expectResultsToMatchModels(next3, [model3, model2, model1]);
        expectPagination(next3, {nextPage: false, previousPage: true});

        const prior3 = await take({previous: 3, previousResults: next3, filter: {order: 'createdAt DESC'}});
        expectResultsToMatchModels(prior3, [model6, model5, model4]);
        expectPagination(prior3, {nextPage: true, previousPage: false});
    });

    // TODO: Provide a mechanism to allow for custom comparisons
    // it('can apply a custom comparison');

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

    async function take({next, previous, previousResults, filter}) {
        if (!previousResults) {
            if (next) {
                return await findWithCursor(TestModel, {takeNext: next}, filter);
            } else {
                return await findWithCursor(TestModel, {takePrevious: previous}, filter);
            }
        }

        if (next) {
            const lastResult = previousResults.results[previousResults.results.length - 1];

            return await findWithCursor(
                TestModel,
                {takeNext: next, skipAfter: lastResult.cursor},
                filter
            );
        } else {
            const firstResult = previousResults.results[0];

            return await findWithCursor(
                TestModel,
                {takePrevious: previous, skipBefore: firstResult.cursor},
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
