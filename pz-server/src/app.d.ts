/// <reference path="../../pz-domain/src/pz-domain.d.ts" />

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
    start: Function
}

type TPaths =  string | RegExp | Array<string | RegExp>;

interface IModelConfig {
    dataSource: string | {}
    'public'?: boolean
    relations?: {}
}

interface IMiddlewareConfig {
    phase: string
    enabled?: boolean
    params?: Array<any>
    paths?: TPaths
}
