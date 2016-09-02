import ExtendableError from './extendable-error';

import {IRepository} from 'pz-server/src/support/repository';
export {IRepository} from 'pz-server/src/support/repository';

import {TOptionalUser} from 'pz-server/src/users/users';
export {TOptionalUser} from 'pz-server/src/users/users';

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

export class AuthorizationError extends ExtendableError { }

export class NotAuthenticatedError extends AuthorizationError {
    constructor(message = 'User is not authenticated') { super(message); }
}

export class NotOwnerError extends AuthorizationError {
    constructor(message = 'User does not own item') { super(message); }
}

