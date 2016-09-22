import promisify from 'pz-support/src/promisify';
import {IUsers, IUser, IUsersBatchable} from 'pz-server/src/users/users';
import {IUserInstance, IUserModel} from 'pz-server/src/models/user';
import {createRecordFromLoopback} from 'pz-server/src/support/repository';
import {loopbackFindAllByIds} from 'pz-server/src/support/loopback-find-all-helpers';

export function createRecordFromLoopbackUser(user: IUserInstance): IUser {
    return createRecordFromLoopback<IUser>('User', user);
}

export default class Users implements IUsers, IUsersBatchable {
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

    async findAllByIds(userIds: Array<number>): Promise<Array<IUser>> {
        const userModels = await loopbackFindAllByIds<IUserModel, IUserInstance>(
            this._UserModel,
            userIds
        );

        return userModels.map(userModel => {
            return createRecordFromLoopbackUser(userModel);
        });
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
