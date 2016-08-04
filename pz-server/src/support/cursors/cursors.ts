import {fromBase64, toBase64} from 'pz-server/src/support/base64';

export type opaqueCursor = string;

export type TBiCursor = IForwardCursor | IBackwardCursor;

export interface IForwardCursor {
    skipAfter?: opaqueCursor
    takeNext: number
}

export interface IBackwardCursor {
    skipBefore?: opaqueCursor
    takePrevious: number
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
    return 'takeNext' in cursor;
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
            takePrevious: cursor.takeNext
        };

        if (cursor.skipAfter) {
            reversedCursor.skipBefore = cursor.skipAfter;
        }

        return reversedCursor;

    } else {
        let reversedCursor: IForwardCursor = {
            takeNext: cursor.takePrevious
        };

        if (cursor.skipBefore) {
            reversedCursor.skipAfter = cursor.skipBefore;
        }

        return reversedCursor;
    }
}
