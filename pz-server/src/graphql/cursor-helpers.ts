
import {
    TBiCursor, IBackwardCursor,
    IForwardCursor, ICursorResults
} from 'pz-server/src/support/cursors/cursors';

export interface IGraphqlCursorArgs {
    first: number
    last: number
    after: string
    before: string
}

export function biCursorFromGraphqlArgs(graphqlArgs: IGraphqlCursorArgs): TBiCursor {
    const take = graphqlArgs.first || graphqlArgs.last || 10;

    if (graphqlArgs.last) {
        let cursor: IBackwardCursor = {
            takeLast: take
        };

        if (graphqlArgs.before) {
            cursor.skipBefore = graphqlArgs.before;
        }

        return cursor;

    } else {
        let cursor: IForwardCursor = {
            takeFirst: take
        };

        if (graphqlArgs.after) {
            cursor.skipAfter = graphqlArgs.after;
        }

        return cursor;
    }
}

export function connectionFromCursorResults<T>(cursorResults: ICursorResults<T>) {
    let pageInfo: any = {
        hasNextPage: cursorResults.hasNextPage || false,
        hasPreviousPage: cursorResults.hasPreviousPage || false
    };

    return {
        edges: cursorResults.results.map(result => {
            return {
                cursor: result.cursor,
                node: result.item
            };
        }),

        pageInfo
    };
}
