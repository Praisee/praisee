import {
    IRepository, IRepositoryRecord, createRecordFromLoopback
} from 'pz-server/src/support/repository';

import promisify from 'pz-support/src/promisify';

export type TOptionalUser = {id: number}; // TODO: Add null as option for TypeScript 2

export interface IUser extends IRepositoryRecord {
    recordType: 'User'
    id: number
    displayName: string
    email: string
}

export interface IUsers extends IRepository {
    findById(userId: number): Promise<IUser>
}

export default class Users implements IUsers {
    private _UserModel: IPersistedModel;

    constructor(User: IPersistedModel) {
        this._UserModel = User;
    }

    async findById(userId: number): Promise<IUser> {
        const result = await promisify(this._UserModel.findById, this._UserModel)(userId);

        if (!result) {
            return null;
        }

        return createRecordFromLoopback<IUser>('User', result);
    }
}
