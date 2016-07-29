import ExtendableError from './extendable-error';

import {IRepository} from 'pz-server/src/support/repository';
export {IRepository} from 'pz-server/src/support/repository';

export interface IUser {
    id: number
}

export type TOptionalUser = IUser; // TODO: Add null as option for TypeScript 2

export interface IAuthorizer<IAuthorizedRepository> {
    as(user: TOptionalUser): IAuthorizedRepository
}

export interface IAuthorizedRepositoryConstructor<IAuthorizedRepository> {
    new (user: TOptionalUser, ...constructorDependencies: Array<any>): IAuthorizedRepository
}

export function authorizer<T>(AuthorizedRepository: IAuthorizedRepositoryConstructor<T>) {
    return class Authorizer implements IAuthorizer<T> {
        private _constructorDependencies: Array<any>;

        constructor(...constructorDependencies: Array<any>) {
            this._constructorDependencies = constructorDependencies;
        }

        as(user: TOptionalUser): T {
            return new AuthorizedRepository(user, ...this._constructorDependencies);
        }
    };
}

export class NotAuthenticatedError extends ExtendableError {
    constructor(message = 'User is not authenticate') { super(message); }
}

export class NotOwnerError extends ExtendableError {
    constructor(message = 'User does not own item') { super(message); }
}

