declare interface IError {
    message: string,
    toString: () => string
}

declare type TError = IError | Error;

declare interface ICallback {
    (error: TError, ...args: Array<any>): any
}
