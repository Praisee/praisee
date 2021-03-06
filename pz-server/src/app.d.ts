/// <reference path="../../pz-support/definitions/loopback.d.ts" />

declare interface IApp {
    services: IServices
}

interface IServices {
    searchClient?: any
    searchUpdater?: any
    remoteApp?: IApp
    cacheConnections?: any
    workerClient?: any
    repositories?: any
    repositoryAuthorizers?: any
}

