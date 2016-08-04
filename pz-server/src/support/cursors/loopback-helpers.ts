import promisify from 'pz-support/src/promisify';

import {
    TBiCursor,
    ICursorResults,
    opaqueCursor,
    isForwardCursor,
    shouldSkipAfter,
    shouldSkipBefore,
    reverseBiCursor, toStringCursor, fromStringCursor, toNumberCursor,
    fromNumberCursor
} from 'pz-server/src/support/cursors/cursors';

import {toDateCursor, fromDateCursor} from 'pz-server/src/support/cursors/cursors';

interface IPersistedModelInstanceWithTimestamp extends IPersistedModelInstance {
    createdAt: Date
}

interface IToCursorResolver {
    (fieldValue: any): opaqueCursor
}

interface IFromCursorResolver {
    (cursor: opaqueCursor): any
}

interface ICursorResolvers {
    toCursor: IToCursorResolver
    fromCursor: IFromCursorResolver
}

export async function findWithCursor<T extends IPersistedModelInstanceWithTimestamp>(
        Model: IPersistedModel,
        cursor: TBiCursor,
        additionalFilter?: IFinderFilter
    ): Promise<ICursorResults<T>> {

    let filter: IFinderFilter = Object.assign({
        order: 'createdAt'
    }, additionalFilter);

    const cursorField = getCursorFieldFromFilter(Model, filter);

    const {toCursor, fromCursor} = createCursorResolversFrom(Model, cursorField);

    filter = applyCursorToFilter(
        filter,

        // The cursor direction needs to be aligned with the sort direction
        isAscendingSort(filter) ? cursor : reverseBiCursor(cursor),

        cursorField,
        fromCursor
    );

    const models = await promisify(Model.find, Model)(filter);

    return createCursorResultsFromModels<T>(
        cursor,
        models,
        cursorField,
        toCursor
    );
}

function getCursorFieldFromFilter(Model: IPersistedModel, filter: IFinderFilter) {
    const defaultField = 'createdAt';

    if (typeof filter.order !== 'string') {
        return defaultField;
    }

    const field = filter.order.split(' ', 2)[0];
    const properties = (Model.definition && Model.definition.properties) || null;

    return properties && properties.hasOwnProperty(field) ? field : defaultField;
}

function isAscendingSort(filter: IFinderFilter) {
    const orderDirectionMatch = filter.order.match(/^.+?\s+(ASC|DESC)/i);

    return (
        !orderDirectionMatch
        || orderDirectionMatch.length < 2
        || orderDirectionMatch[1].toLocaleLowerCase() !== 'desc'
    );
}

function createCursorResolversFrom(Model: IPersistedModel, field: string): ICursorResolvers {
    const defaultCursorResolvers = {
        toCursor: toStringCursor,
        fromCursor: fromStringCursor
    };

    const fieldHasType = (
        Model.definition
        && Model.definition.properties
        && Model.definition.properties[field]
        && Model.definition.properties[field].type
        && Model.definition.properties[field].type.name
    );

    if (!fieldHasType) {
        return defaultCursorResolvers;
    }

    const fieldType = Model.definition.properties[field].type.name;

    switch (fieldType) {
        case 'String':
            return {
                toCursor: toStringCursor,
                fromCursor: fromStringCursor
            };

        case 'Number':
            return {
                toCursor: toNumberCursor,
                fromCursor: fromNumberCursor
            };

        case 'Date':
            return {
                toCursor: toDateCursor,
                fromCursor: fromDateCursor
            };
    }

    return defaultCursorResolvers;
}

function applyCursorToFilter(
        filter: IFinderFilter,
        cursor: TBiCursor,
        cursorField: string,
        fromCursor: IFromCursorResolver
    ): IFinderFilter {

    let cursorWhere: any = {};
    let cursorLimit: number;

    if (isForwardCursor(cursor)) {
        cursorLimit = cursor.takeNext + 1;

        if (cursor.skipAfter) {
            cursorWhere[cursorField] = { gt: fromCursor(cursor.skipAfter) };
        }

    } else {
        cursorLimit = cursor.takePrevious + 1;

        if (cursor.skipBefore) {
            cursorWhere[cursorField] = { lt: fromCursor(cursor.skipBefore) };
        }
    }

    filter = Object.assign({}, filter, {
        where: Object.assign({}, filter.where, cursorWhere),
        limit: cursorLimit
    });

    return filter;
}

function createCursorResultsFromModels<T extends IPersistedModelInstance>(
        cursor: TBiCursor,
        models: Array<T>,
        cursorField: string,
        toCursor: IToCursorResolver
    ): ICursorResults<T> {

    let expectedModels, hasPreviousPage = false, hasNextPage = false;

    if (isForwardCursor(cursor)) {
        if (shouldSkipAfter(cursor)) {
            // TODO: This is a hack since we don't know if there was a previous item
            hasPreviousPage = true;
        }

        if (models.length >= (cursor.takeNext + 1)) {
            expectedModels = models.slice(0, models.length - 1);
            hasNextPage = true;

        } else {
            expectedModels = models;
        }
    } else {
        if (shouldSkipBefore(cursor)) {
            hasNextPage = true;
        }

        if (models.length >= (cursor.takePrevious + 1)) {
            expectedModels = models.slice(0, models.length - 1);
            hasNextPage = true;

        } else {
            expectedModels = models;
        }
    }

    return {
        results: expectedModels.map(model => {
            return {
                cursor: toCursor(model[cursorField]),
                item: model
            };
        }),

        hasNextPage,
        hasPreviousPage
    };
}
