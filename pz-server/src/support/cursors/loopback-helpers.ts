import promisify from 'pz-support/src/promisify';

import {
    TBiCursor,
    ICursorResults,
    opaqueCursor,
    toStringCursor, fromStringCursor, toNumberCursor,
    fromNumberCursor
} from 'pz-server/src/support/cursors/cursors';

import {toDateCursor, fromDateCursor} from 'pz-server/src/support/cursors/cursors';
import {applyCursorToSearch} from './search-helpers';

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

export async function findWithCursor<TModelInstance extends IPersistedModelInstanceWithTimestamp>(
        Model: IPersistedModel,
        cursor: TBiCursor,
        additionalFilter?: IFinderFilter
    ): Promise<ICursorResults<TModelInstance>> {

    const filter: IFinderFilter = Object.assign({
        order: 'createdAt'
    }, additionalFilter);

    const searchField = getCursorFieldFromFilter(Model, filter);

    const {toCursor, fromCursor} = createCursorResolversFrom(Model, searchField);

    const isAscendingSortValue = isAscendingSort(filter.order);

    return await applyCursorToSearch<IFinderFilter, TModelInstance>({
            cursor,

            search: filter,

            searchFields: [searchField],

            getCursorFromSearchResult: (model) => {
                return toCursor(model[searchField]);
            },

            getSearchFieldValueFromCursor: (cursor) => {
                return fromCursor(cursor);
            },

            isAscendingSort: () => isAscendingSortValue,

            updateSearchFilter: (filter, searchField, toGreaterThan, searchFieldValue) => Object.assign({}, filter, {
                where: Object.assign({}, filter.where, {
                    [searchField]: { [toGreaterThan ? 'gt' : 'lt']: searchFieldValue }
                })
            }),

            updateSearchOrder: (filter, searchField, toAscending) => {
                let order;

                // Reverse the sort order based on which direction it is currently
                // (isAscendingSortValue) and which direction it needs to be (toAscending).

                if (isAscendingSortValue) {
                    order = toAscending ? filter.order : reverseSortOrder(filter.order);
                } else {
                    order = toAscending ? reverseSortOrder(filter.order) : filter.order;
                }

                return Object.assign({}, filter, { order });
            },

            updateSearchLimit: (filter, toLimit) => Object.assign({}, filter, {
                limit: toLimit
            }),

            performSearch: async (filter) => await promisify(Model.find, Model)(filter)
    });
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

