/// <reference path="../../pz-server/src/app.d.ts" />

// http://apidocs.strongloop.com/loopback/#model
declare interface IModel extends IValidatable {
    new (...properties: Array<any>): IModelInstance

    modelName: string
    dataSource: IDataSource
    remoteMethod(name: string, options: any)
    app?: IApp
    
    on(eventName: TModelEvent, listener: Function)
    
    // https://apidocs.strongloop.com/loopback-datasource-juggler/#modelbaseclass-defineproperty
    defineProperty(propertyName: string, propertyDefinition: {})

    // https://apidocs.strongloop.com/loopback-datasource-juggler/#relationmixin
    belongsTo(model: string | IModel, options?: {})
    hasOne(model: string | IModel, options?: {})
    hasMany(model: string | IModel, options?: {})
    hasAndBelongsToMany(model: string | IModel, options?: {})
    
    settings: any
    
    setup()
    getApp(next: (error: TError, app: IApp) => any)
}

// http://apidocs.strongloop.com/loopback/#model
declare interface IModelInstance {
}

// http://apidocs.strongloop.com/loopback/#persistedmodel
declare interface IPersistedModel extends IModel {
    new (...properties: Array<any>): IPersistedModelInstance

    find(filter: IFinderFilter, callback: IResultCallback<Array<IPersistedModelInstance>>)
    find(filter: IFinderFilter, options: {}, callback: IResultCallback<Array<IPersistedModelInstance>>)
    
    findOne(filter: IFinderFilter, callback: IResultCallback<IPersistedModelInstance>)
    findOne(filter: IFinderFilter, options: {}, callback: IResultCallback<IPersistedModelInstance>)

    findById(id: any, callback: IResultCallback<IPersistedModelInstance>)
    findById(id: any, filter: IFinderFilter, callback: IResultCallback<IPersistedModelInstance>)

    count(where: {}, callback: IResultCallback<number>)

    create(data: any, done?: ICallback)
    
    upsert(data: any, done: (error: TError, model: IPersistedModelInstance) => void)
    
    destroyAll(done?: ICallback)
    destroyAll(where: any, done?: ICallback)
    
    beginTransaction(next: ITransactionCallback)
    beginTransaction(options: {isolationLevel?: string, timeout?: number}, next: ITransactionCallback)
    
    Transaction: {
        READ_UNCOMMITTED
        READ_COMMITTED
        REPEATABLE_READ
        SERIALIZABLE
    }
    
    observe(operation: TOperationHook, listener: IOperationHookCallback)
    
    scope(name: string, definition: {} | Function)
}

// http://apidocs.strongloop.com/loopback/#persistedmodel
declare interface IPersistedModelInstance extends IModelInstance {
    id: any
    
    save(done?: ICallback)
    save(options: {validate?: boolean, throws?: boolean}, done?: ICallback)
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
    order?: string
    skip?: number
    where?: any
}

// https://docs.strongloop.com/display/public/LB/Events#Events-Modelevents
declare type TModelEvent = (
    'changed'
    | 'deleted'
    | 'deletedAll'
    | 'attached'
    | 'dataSourceAttached'
    | 'set'
);

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
    (context: IOperationHookContext, next?: ICallback): void | Promise<any>
}

// https://docs.strongloop.com/display/public/LB/Operation+hooks#Operationhooks-Operationhookcontextobject
declare interface IOperationHookContext {
    Model: IPersistedModel,
    hookState: any,
    data?: any,
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

declare class Review {
    id: string;
    reviewerId: string;
    rating: number;
    date: Date;
}

declare class Reviewer {
    id: string;
    email: string;
    reputation: number;
}

declare class Vote {
    id: string;
    reviewerId: string;
    upVote: boolean;
}
