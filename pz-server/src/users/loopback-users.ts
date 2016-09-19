import promisify from 'pz-support/src/promisify';
import {IUsers, IUser} from 'pz-server/src/users/users';
import {IUserInstance, IUserModel} from 'pz-server/src/models/user';
import {createRecordFromLoopback} from 'pz-server/src/support/repository';

export function createRecordFromLoopbackUser(user: IUserInstance): IUser {
    return createRecordFromLoopback<IUser>('User', user);
}

export default class Users implements IUsers {
    private _UserModel: IUserModel;

    constructor(User: IUserModel) {
        this._UserModel = User;
    }

    async findById(userId: number): Promise<IUser> {
        const result = await promisify(this._UserModel.findById, this._UserModel)(userId);

        if (!result) {
            return null;
        }

        return createRecordFromLoopbackUser(result);
    }

    async getTotalCommunityItems(userId: number): Promise<number> {
        return await this._UserModel.getTotalCommunityItems(userId);
    }

    async create(email: string, password: string, displayName: string): Promise<IUser> {
        const createUser = promisify(this._UserModel.create, this._UserModel);
        const user = await createUser({email, password, displayName});
        return user;
    }
}
