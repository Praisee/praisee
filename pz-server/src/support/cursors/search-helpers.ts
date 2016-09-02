import {
    TBiCursor,
    ICursorResults,
    opaqueCursor,
    isForwardCursor,
    isInvalidBiCursor
} from 'pz-server/src/support/cursors/cursors';

export type TSearchField = any;
export type TSearchFields = Array<TSearchField>;

export interface ICursorFromSearchResultResolver<TSearchResult> {
    (searchResult: TSearchResult, cursorFields: TSearchFields): opaqueCursor
}

export interface ISearchFieldValueFromCursorResolver<TSearch> {
    (cursor: opaqueCursor, search: TSearch, searchField: TSearchField): any
}

export interface ISearchOrderGetter<TSearch> {
    (search: TSearch, searchField: TSearchField): boolean
}

export interface ISearchFilterUpdater<TSearch> {
    (search: TSearch, searchField: TSearchField, toGreaterThan: boolean, cursorValue: any): TSearch
}

export interface ISearchOrderUpdater<TSearch> {
    (search: TSearch, searchField: TSearchField, toAscending: boolean): TSearch
}

export interface ISearchLimitUpdater<TSearch> {
    (search: TSearch, toLimit: number): TSearch
}

export interface ISearchPerformer<TSearch, TSearchResult> {
    (search: TSearch): Promise<Array<TSearchResult>>
}

export interface IApplyCursorToSearchConfig<TSearch, TSearchResult> {
    cursor: TBiCursor,
    search: TSearch,
    searchFields: TSearchFields,
    getCursorFromSearchResult: ICursorFromSearchResultResolver<TSearchResult>,
    getSearchFieldValueFromCursor: ISearchFieldValueFromCursorResolver<TSearch>,
    isAscendingSort: ISearchOrderGetter<TSearch>,
    updateSearchFilter: ISearchFilterUpdater<TSearch>,
    updateSearchOrder: ISearchOrderUpdater<TSearch>,
    updateSearchLimit: ISearchLimitUpdater<TSearch>,
    performSearch: ISearchPerformer<TSearch, TSearchResult>
}

export async function applyCursorToSearch<TSearch, TSearchResult>(
        searchConfig: IApplyCursorToSearchConfig<TSearch, TSearchResult>
    ): Promise<ICursorResults<TSearchResult>> {

    const {
        cursor,
        search,
        searchFields,
        getCursorFromSearchResult,
        getSearchFieldValueFromCursor,
        isAscendingSort,
        updateSearchFilter,
        updateSearchOrder,
        updateSearchLimit,
        performSearch
    } = searchConfig;

    if (isInvalidBiCursor(cursor)) {
        throw new Error('Invalid bi-cursor provided');
    }

    const updatedSearch = applyCursorToFilter<TSearch>(
        cursor,
        search,
        isAscendingSort,
        updateSearchOrder,
        updateSearchFilter,
        updateSearchLimit,
        searchFields,
        getSearchFieldValueFromCursor
    );

    const results = await performSearch(updatedSearch);

    return createCursorResultsFromSearchResults<TSearchResult>(
        cursor,
        searchFields,
        results,
        getCursorFromSearchResult
    );
}

function applyCursorToFilter<TSearch>(
        cursor: TBiCursor,
        search: TSearch,
        isAscendingSort: ISearchOrderGetter<TSearch>,
        updateSearchOrder: ISearchOrderUpdater<TSearch>,
        updateSearchFilter: ISearchFilterUpdater<TSearch>,
        updateSearchLimit: ISearchLimitUpdater<TSearch>,
        searchFields: TSearchFields,
        getSearchFieldValueFromCursor: ISearchFieldValueFromCursorResolver<TSearch>
    ): TSearch {

    let updatedSearch = search;

    if (isForwardCursor(cursor)) {
        updatedSearch = updateSearchLimit(updatedSearch, cursor.takeFirst + 1);

        for (let searchField of searchFields) {
            if (cursor.skipAfter) {
                const isGreaterThan = isAscendingSort(search, searchField);

                updatedSearch = updateSearchFilter(
                    updatedSearch,
                    searchField,
                    isGreaterThan,
                    getSearchFieldValueFromCursor(cursor.skipAfter, search, searchField)
                );
            }
        }

    } else {

        updatedSearch = updateSearchLimit(updatedSearch, cursor.takeLast + 1);

        for (let searchField of searchFields) {
            let isFieldSortedDescending = !isAscendingSort(search, searchField);

            updatedSearch = updateSearchOrder(
                updatedSearch,
                searchField,
                isFieldSortedDescending
            );

            if (cursor.skipBefore) {
                const isGreaterThan = isFieldSortedDescending;

                updatedSearch = updateSearchFilter(
                    updatedSearch,
                    searchField,
                    isGreaterThan,
                    getSearchFieldValueFromCursor(cursor.skipBefore, search, searchField)
                );
            }
        }
    }

    return updatedSearch;
}

function createCursorResultsFromSearchResults<TSearchResult>(
        cursor: TBiCursor,
        searchFields: TSearchFields,
        results: Array<TSearchResult>,
        getCursorFromSearchResult: ICursorFromSearchResultResolver<TSearchResult>
    ): ICursorResults<TSearchResult> {

    let expectedResults, hasPreviousPage = false, hasNextPage = false;

    // Note: nextPage and previousPage should always be false in some circumstances
    // due to the Connections spec. See:
    // https://github.com/graphql/graphql-relay-js/issues/58

    if (isForwardCursor(cursor)) {
        if (results.length >= (cursor.takeFirst + 1)) {
            expectedResults = results.slice(0, results.length - 1);
            hasNextPage = true;

        } else {
            expectedResults = results;
        }
    } else {
        if (results.length >= (cursor.takeLast + 1)) {
            expectedResults = results.slice(0, results.length - 1).reverse();
            hasPreviousPage = true;

        } else {
            expectedResults = results.slice(0).reverse();
        }
    }

    return {
        results: expectedResults.map(result => {
            return {
                cursor: getCursorFromSearchResult(result, searchFields),
                item: result
            };
        }),

        hasNextPage,
        hasPreviousPage
    };
}
