import promisify from 'pz-support/src/promisify';

import {
    TBiCursor,
    ICursorResults,
    opaqueCursor,
    isForwardCursor,
    shouldSkipAfter,
    shouldSkipBefore,
    reverseBiCursor, toStringCursor, fromStringCursor, toNumberCursor,
    fromNumberCursor, isInvalidBiCursor
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

    if (isInvalidBiCursor(cursor)) {
        throw new Error('Invalid bi-cursor provided');
    }

    let filter: IFinderFilter = Object.assign({
        order: 'createdAt'
    }, additionalFilter);

    const cursorField = getCursorFieldFromFilter(Model, filter);

    const {toCursor, fromCursor} = createCursorResolversFrom(Model, cursorField);

    filter = applyCursorToFilter(
        cursor,
        filter,
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

    const field = (filter.order as string).split(' ', 2)[0];
    const properties = (Model.definition && Model.definition.properties) || null;

    return properties && properties.hasOwnProperty(field) ? field : defaultField;
}

function reverseSortOrder(order: string | Array<string>): string | Array<string> {
    const orderClauses: Array<string> = Array.isArray(order) ?
        order as Array<string>
        : (order as string).split(',');

    const reversedClauses = orderClauses.map(orderClause => {
        const cleanedOrderClause = orderClause.trim();
        const orderClauseParts = orderClause.match(/([^\s]+)\s+(ASC|DESC)$/i);

        if (!orderClauseParts) {
            return cleanedOrderClause + ' DESC';
        }

        const [_, sortField, sortDirection] = orderClauseParts;

        return sortDirection === 'ASC' ? sortField + ' DESC' : sortField + ' ASC';
    });

    if (reversedClauses.length > 2) {
        return reversedClauses;
    } else {
        return reversedClauses[0];
    }
}

function isAscendingSort(order: string | Array<string>) {
    const orderClause: string = Array.isArray(order) ? order[0] : order as string;
    const orderDirectionMatch = orderClause.match(/\s+(ASC|DESC)$/i);

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
        cursor: TBiCursor,
        filter: IFinderFilter,
        cursorField: string,
        fromCursor: IFromCursorResolver
    ): IFinderFilter {

    let cursorOrder: string | Array<string>;
    let cursorLimit: number;
    let cursorWhere: any = {};

    if (isForwardCursor(cursor)) {
        cursorOrder = filter.order;
        cursorLimit = cursor.takeFirst + 1;

        if (cursor.skipAfter) {
            const sortOperator = isAscendingSort(cursorOrder) ? 'gt' : 'lt';
            cursorWhere[cursorField] = { [sortOperator]: fromCursor(cursor.skipAfter) };
        }

    } else {
        cursorOrder = filter.order ? reverseSortOrder(filter.order) : cursorField + ' DESC';
        cursorLimit = cursor.takeLast + 1;

        if (cursor.skipBefore) {
            const sortOperator = isAscendingSort(cursorOrder) ? 'gt' : 'lt';
            cursorWhere[cursorField] = { [sortOperator]: fromCursor(cursor.skipBefore) };
        }
    }

    filter = Object.assign({}, filter, {
        where: Object.assign({}, filter.where, cursorWhere),
        order: cursorOrder,
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

    // Note: nextPage and previousPage should always be false in some circumstances
    // due to the Connections spec. See:
    // https://github.com/graphql/graphql-relay-js/issues/58

    if (isForwardCursor(cursor)) {
        if (models.length >= (cursor.takeFirst + 1)) {
            expectedModels = models.slice(0, models.length - 1);
            hasNextPage = true;

        } else {
            expectedModels = models;
        }
    } else {
        if (models.length >= (cursor.takeLast + 1)) {
            expectedModels = models.slice(0, models.length - 1).reverse();
            hasPreviousPage = true;

        } else {
            expectedModels = models.slice(0).reverse();
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
