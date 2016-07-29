/// <reference path="../../pz-support/definitions/common.d.ts" />

// http://apidocs.strongloop.com/loopback/#application-new-application
declare interface IApp {
    connector(name: string, connector: any)

    dataSource(name: string, config: any)

    dataSources: any

    enableAuth()

    model(model: IModel | string, config: IModelConfig)
    models: any

    remoteObjects(): any
    remotes(): any

    middlewareFromConfig(factory: Function, config: IMiddlewareConfig): IApp

    defineMiddlewarePhases(nameOrNames: string | Array<string>): IApp

    middleware(name: string, paths: TPaths, handler: Function): IApp
    middleware(name: string, handler: Function): IApp

    // Express
    get: Function
    post: Function
    put: Function
    patch: Function
    'delete': Function
    engine: Function
    set: Function
    listen: Function
    emit: Function
    on: Function
    start: Function
    use: Function
}

// http://apidocs.strongloop.com/loopback/#model
declare interface IModel extends IValidatable {
    new (...properties: Array<any>): IModelInstance

    modelName: string
    dataSource: IDataSource
    app?: IApp

    sharedClass: ISharedClassInstance
    remoteMethod(name: string, options: any)
    disableRemoteMethod(methodName: string, isStatic: boolean)

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
    // https://github.com/strongloop/loopback-datasource-juggler/blob/v2.46.1/lib/model-definition.js#L269
    toJSON(forceRebuild?: boolean)
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

    updateAll(data: any, done?: ICallback)
    updateAll(where: any, data: any, done?: ICallback)

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
    removeObserver(operation: TOperationHook, listener: IOperationHookCallback)

    scope(name: string, definition: {} | Function)
}

// http://apidocs.strongloop.com/loopback/#persistedmodel
declare interface IPersistedModelInstance extends IModelInstance {
    id: any
    __data?: any // Don't use this, unless you're an elite hacker

    save(done?: IResultCallback<IPersistedModelInstance>)
    save(options: {validate?: boolean, throws?: boolean}, done?: IResultCallback<IPersistedModelInstance>)
    destroy(done?: ICallback)
}

interface ITransactionCallback {
    (error: TError, transaction: ITransactionInstance)
}

interface ITransactionInstance {
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

interface IResultCallback<T> {
    (error: TError, result: T)
}

interface IDataSource {
    connector: {
        execute: (sql: String, params: Array<any>, callback: ICallback) => void,
        //https://apidocs.strongloop.com/strong-remoting/#remoteobjects-prototype-invoke
        remotes:{
            invoke: (remoteMethodName: string, ctorArgs?: string, args?: string, callback?: Function) => void
        }
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

// https://apidocs.strongloop.com/strong-remoting/#sharedclass
interface ISharedClass {
}

// https://apidocs.strongloop.com/strong-remoting/#sharedclass
interface ISharedClassInstance {
    defineMethod(name: string, options?: {})
    disableMethod(methodName: string, isStatic: boolean)
    find(methodName: string, isStatic?: boolean): ISharedMethodInstance
    getKeyFromMethodNameAndTarget(methodName: string, isStatic: boolean)
    methods(options?: {}): Array<ISharedMethodInstance>

    resolve(resolver:
        (define:
            (name: string, options: {}, method:
                (methodName: string, callback: ICallback) => any
            ) => any
        ) => any
    )
}

// https://apidocs.strongloop.com/strong-remoting/#sharedmethod
interface ISharedMethod {
}

// https://apidocs.strongloop.com/strong-remoting/#sharedmethod
interface ISharedMethodInstance {
    name: string
    isStatic: boolean
}

type TPaths = string | RegExp | Array<string | RegExp>;

interface IModelConfig {
    dataSource: string | any
    'public'?: boolean
    relations?: any
}

interface IMiddlewareConfig {
    phase: string
    enabled?: boolean
    params?: Array<any>
    paths?: TPaths
}
