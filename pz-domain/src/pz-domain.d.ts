/// <reference path="../../pz-server/src/app.d.ts" />

// http://apidocs.strongloop.com/loopback/#model
declare interface IModel extends IValidatable {
    new (...properties: Array<any>): IModelInstance

    modelName: string
    dataSource: IDataSource
    remoteMethod(name: string, options: any)
    app?: IApp
}

// http://apidocs.strongloop.com/loopback/#model
declare interface IModelInstance {
}

// http://apidocs.strongloop.com/loopback/#persistedmodel
declare interface IPersistedModel extends IModel {
    new (...properties: Array<any>): IPersistedModelInstance

    find(filter: IFinderFilter, callback: IResultCallback<Array<IPersistedModelInstance>>)
    findOne(filter: IFinderFilter, callback: IResultCallback<IPersistedModelInstance>)

    findById(id: any, callback: IResultCallback<IPersistedModelInstance>)
    findById(id: any, filter: IFinderFilter, callback: IResultCallback<IPersistedModelInstance>)

    upsert(data: any, done: (error: TError, model: IPersistedModelInstance) => void)
    
    beginTransaction(next: ITransactionCallback)
    beginTransaction(options: {isolationLevel?: string, timeout?: number}, next: ITransactionCallback)
    
    observe(operation: TOperationHook, listener: IOperationHookCallback)
}

// http://apidocs.strongloop.com/loopback/#persistedmodel
declare interface IPersistedModelInstance extends IModelInstance {
    save(done: ICallback)
    save(options: {validate?: boolean, throws?: boolean}, done: ICallback)
    destroy(done?: ICallback)
}

declare interface ITransactionCallback {
    (error: TError, transaction: ITransactionInstance)
}

declare interface ITransactionInstance {
    commit(done?: ICallback)
    rollback(done?: ICallback)
}

declare interface IFinderFilter {
    fields?: any
    include?: any
    order?: 'ASC' | 'DESC'
    skip?: number
    where?: any
}

// https://docs.strongloop.com/display/public/LB/Operation+hooks#Operationhooks-Overview
declare type TOperationHook = (
    'access'
    | 'before save'
    | 'after save'
    | 'before delete'
    | 'after delete'
    | 'loaded'
    | 'persist'
);

declare interface IOperationHookCallback {
    (context: IOperationHookContext, next: ICallback)
}

// https://docs.strongloop.com/display/public/LB/Operation+hooks#Operationhooks-Operationhookcontextobject
declare interface IOperationHookContext {
    Model: IPersistedModel,
    hookState: any,
    options?: any,
    instance?: any,
    where?: any,
    isNewInstance?: boolean,
    currentInstance?: any
}

declare interface IError {
    message: string,
    toString: () => string
}

declare type TError = IError | Error;

declare interface ICallback {
    (error: TError, ...args: Array<any>): any
}

declare interface IResultCallback<T> {
    (error: TError, result: T)
}

declare interface IDataSource {
    connector: {
        execute: (sql: String, params: Array<any>, callback: ICallback) => void
    }
}

declare interface IValidator {
    (error: TError, done: () => void)
}

// https://apidocs.strongloop.com/loopback-datasource-juggler/#validatable
declare interface IValidatable {
    validate(propertyName: string, validatorFn: IValidator, options: {
        message?: string
    })
    
    validateAsync(propertyName: string, validatorFn: IValidator, options: {
        message?: string
    })
    
    validatesAbsenceOf(propertyName: string, errMsg: any)
    
    validatesExclusionOf(propertyName: string, options: {
        'in': Array<any>
        message?: string
    })
    
    validatesFormatOf(propertyName: string, options: {
        'with': RegExp
        message?: string
    })
    
    validatesInclusionOf(propertyName: string, options: {
        'in': Array<any>
        message?: string
    })
    
    validatesLengthOf(propertyName: string, options: {
        is?: number
        min?: number
        max?: number
        message?: string
    })
    
    validatesNumericalityOf(propertyName: string, options: {
        int?: boolean
        message?: string
    })
    
    validatesPresenceOf(propertyName: string, errMsg: any)
    
    validatesUniquenessOf(propertyName: string, options: {
        'with': RegExp
        scopedTo?: Array<string>
        message?: string
    })
}

declare interface IValidationError {
    name: string,
    status: number,
    statusCode: number,
    message: string,
    details: any
}
