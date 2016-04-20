declare interface IError {
    message: string,
    toString: () => string
}

declare interface ICallback {
    (error: IError | Error, ...args: Array<any>): any
}

declare interface IDataSource {
    connector: {
        execute: (sql: String, params: Array<any>, callback: ICallback) => void
    }
}

declare interface IModel {
    dataSource: IDataSource,
    findById: Function,
    remoteMethod: Function
}
