import {fromBase64, toBase64} from 'pz-server/src/support/base64';

export type opaqueCursor = string;

export type TBiCursor = IForwardCursor | IBackwardCursor;

export interface IForwardCursor {
    skipAfter?: opaqueCursor
    takeFirst: number
}

export interface IBackwardCursor {
    skipBefore?: opaqueCursor
    takeLast: number
}

export interface ICursorResults<T> {
    results: Array<ICursorResult<T>>
    hasPreviousPage?: boolean
    hasNextPage?: boolean
}

export interface ICursorResult<T> {
    cursor: opaqueCursor
    item: T
}

export function isForwardCursor(cursor: TBiCursor): cursor is IForwardCursor {
    return 'takeFirst' in cursor;
}

export function isInvalidBiCursor(cursor: TBiCursor): boolean {
    const takeFirstInCursor = 'takeFirst' in cursor;
    const takeLastInCursor = 'takeLast' in cursor;
    const skipBeforeInCursor = 'skipBefore' in cursor;
    const skipAfterInCursor = 'skipAfter' in cursor;

    if (takeFirstInCursor === takeLastInCursor) {
        return true;
    }

    if (skipBeforeInCursor && skipAfterInCursor) {
        return true;
    }

    let take;

    if (isForwardCursor(cursor)) {
        if (skipBeforeInCursor) {
            return true;
        }

        take = cursor.takeFirst;
    } else {
        if (skipAfterInCursor) {
            return true;
        }

        take = cursor.takeLast;
    }

    if (Number.isNaN(take) || !Number.isFinite(take) || take < 1) {
        return true;
    }

    return false;
}

export function shouldSkipAfter(cursor: IForwardCursor | TBiCursor): cursor is IForwardCursor {
    return !!(cursor as IForwardCursor).skipAfter;
}

export function shouldSkipBefore(cursor: IBackwardCursor | TBiCursor): cursor is IBackwardCursor {
    return !!(cursor as IBackwardCursor).skipBefore;
}

export function fromStringCursor(cursor: opaqueCursor): string {
    return fromBase64(cursor);
}

export function toStringCursor(string: string): opaqueCursor {
    return toBase64(string);
}

export function fromNumberCursor(cursor: opaqueCursor): number {
    const number = Number(fromBase64(cursor));

    if (Number.isNaN(number) || !Number.isFinite(number)) {
        throw new Error('Unable to create valid number from cursor: ' + cursor);
    }

    return number;
}

export function toNumberCursor(number: number): opaqueCursor {
    if (Number.isNaN(number) || !Number.isFinite(number)) {
        throw new Error('Invalid numbers cannot be cursors');
    }

    return toBase64(number.toString());
}

export function fromDateCursor(cursor: opaqueCursor): Date {
    const date = new Date(fromStringCursor(cursor));

    if (!date || !date.valueOf || Number.isNaN(date.valueOf())) {
        throw new Error('Unable to create valid date from cursor: ' + cursor);
    }

    return date;
}

export function toDateCursor(date: Date): opaqueCursor {
    if (!date || !date.valueOf || Number.isNaN(date.valueOf())) {
        throw new Error('Invalid dates cannot be cursors');
    }

    return toStringCursor(date.toISOString());
}

export function reverseBiCursor(cursor: TBiCursor): TBiCursor {
    if (isForwardCursor(cursor)) {
        let reversedCursor: IBackwardCursor = {
            takeLast: cursor.takeFirst
        };

        if (cursor.skipAfter) {
            reversedCursor.skipBefore = cursor.skipAfter;
        }

        return reversedCursor;

    } else {
        let reversedCursor: IForwardCursor = {
            takeFirst: cursor.takeLast
        };

        if (cursor.skipBefore) {
            reversedCursor.skipAfter = cursor.skipBefore;
        }

        return reversedCursor;
    }
}

export function createEmptyCursorResults<T>(): ICursorResults<T> {
    return {
        results: [],
        hasPreviousPage: false,
        hasNextPage: false
    };
}
