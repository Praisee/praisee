import {IRepository} from 'pz-server/src/support/repository';

export interface IPermissionsConstructor {
    new (repository: IRepository, user: TUser)
}

export interface IPermissions {
}

export type TUser = IUser | null;

interface IUser {
    id: number
}

export class RepositoryAuthorizor<RepositoryType, PermissionsType> {
    private _repository;
    private _permissionsConstructor;

    constructor(repository: IRepository, permissionConstructor: IPermissionsConstructor) {
        this._repository = repository;
        this._permissionsConstructor = permissionConstructor;
    }

    as(user: TUser): RepositoryType & PermissionsType {
        const permissions = new this._permissionsConstructor(this._repository, user);
        return this._applyPermissionsToRepository<RepositoryType, PermissionsType>(permissions);
    }

    private _applyPermissionsToRepository<T, U>(permissions) {
        let permissionedRepository = {};

        for (let propertyName in this._repository) {
            let property = this._repository[propertyName];

            if (typeof property === 'function' || property instanceof Function) {
              permissionedRepository[propertyName] = property.bind(this._repository);
            }
        }

        for (let propertyName in permissions) {
            let property = permissions[propertyName];

            if (typeof property === 'function' || property instanceof Function) {
              permissionedRepository[propertyName] = property.bind(permissions);
            }
        }

        return permissionedRepository as T & U;
    }
}
