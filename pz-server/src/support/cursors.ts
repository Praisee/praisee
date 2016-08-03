import {fromBase64, toBase64} from 'pz-server/src/support/base64';

export type opaqueCursor = string;

export type TBiCursor = IForwardCursor | IBackwardCursor;

export interface IForwardCursor {
    skipAfter?: opaqueCursor
    take: number
}

export interface IBackwardCursor {
    skipBefore?: opaqueCursor
    take: number
}

export interface ICursorResults<T> {
    results: Array<ICursorResult<T>>
    startCursor?: opaqueCursor
    endCursor?: opaqueCursor
    hasPreviousPage?: boolean
    hasNextPage?: boolean
}

export interface ICursorResult<T> {
    cursor: opaqueCursor
    item: T
}

export function isForwardCursor(cursor: TBiCursor): cursor is IForwardCursor {
    return !('skipBefore' in cursor);
}

export function shouldSkipAfter(cursor: IForwardCursor | TBiCursor): cursor is IForwardCursor {
    return !!(cursor as IForwardCursor).skipAfter;
}

export function shouldSkipBefore(cursor: IBackwardCursor | TBiCursor): cursor is IBackwardCursor {
    return !!(cursor as IBackwardCursor).skipBefore;
}

export function fromDateCursor(cursor: opaqueCursor): Date {
    return new Date(fromBase64(cursor));
}

export function toDateCursor(date: Date): opaqueCursor {
    return toBase64(date.toISOString());
}
