import {ICursorResults, ICursorResult} from 'pz-server/src/support/cursors/cursors';

export interface ICursorResultMapper<T, U> {
    (cursorResult: ICursorResult<T>, index: number, results: Array<ICursorResult<T>>): ICursorResult<U>
}

export interface ICursorResultItemMapper<T, U> {
    (item: T, index: number, results: Array<ICursorResult<T>>): U
}

export interface IPromisedCursorResultMapper<T, U> {
    (cursorResult: ICursorResult<T>, index: number, results: Array<ICursorResult<T>>): Promise<ICursorResult<U>>
}

export function mapCursorResults<T, U>(
        cursorResults: ICursorResults<T>,
        mapper: ICursorResultMapper<T, U>
    ): ICursorResults<U> {

    return Object.assign({}, cursorResults, {
        results: cursorResults.results.map(mapper)
    });
}

export function mapCursorResultItems<T, U>(
        cursorResults: ICursorResults<T>,
        mapper: ICursorResultItemMapper<T, U>
    ): ICursorResults<U> {

    return Object.assign({}, cursorResults, {
        results: cursorResults.results.map((cursorResult, index, results) => {
            return Object.assign({}, cursorResult, {
                item: mapper(cursorResult.item, index, results)
            })
        })
    });
}

export async function promisedMapCursorResults<T, U>(
        cursorResults: ICursorResults<T>,
        mapper: IPromisedCursorResultMapper<T, U>
    ): Promise<ICursorResults<U>> {

    const results = await Promise.all<ICursorResult<U>>(
        cursorResults.results.map(mapper)
    );

    return Object.assign({}, cursorResults, {
        results
    });
}
