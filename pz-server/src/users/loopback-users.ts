import {
    IUrlSlugInstance,
    IUrlSlugModel
} from 'pz-server/src/url-slugs/models/url-slug';
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
    private _UrlSlugsModel: IPersistedModel;
    
    constructor(User: IUserModel, UrlSlug: IUrlSlugModel) {
        this._UserModel = User;
        this._UrlSlugsModel = UrlSlug;
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

    async findByUrlSlugName(fullSlug: string): Promise<IUser> {
        let urlSlug: IUrlSlugInstance = await promisify(this._UrlSlugsModel.findOne, this._UrlSlugsModel)({
            where: {
                sluggableType: this._UserModel.sluggableType,
                fullSlugLowercase: fullSlug.toLowerCase()
            }
        });

        if (urlSlug) {
            const result = await promisify(this._UserModel.findById, this._UserModel)(urlSlug.sluggableId);
            return createRecordFromLoopbackUser(result);
        }

        return null;
    }

    async getTotalCommunityItems(userId: number): Promise<number> {
        return await this._UserModel.getTotalCommunityItems(userId);
    }

    async getTotalTrusters(userId: number): Promise<number> {
        return await this._UserModel.getTotalTrusters(userId);
    }

    async getReputation(userId: number): Promise<number> {
        return this._UserModel.getReputation(userId);
    }

    async isUserTrusting(trusterId: number, trustedId: number): Promise<boolean> {
        return await this._UserModel.isUserTrusting(trusterId, trustedId);
    }

    async addTrust(trusterId: number, trustedId: number): Promise<boolean> {
        const find = promisify(this._UserModel.find, this._UserModel);

        const userModels: Array<IUserInstance> = await find({
            where: { id: { inq: [trusterId, trustedId] } }
        });

        let truster = userModels.find((user) => user.id === trusterId);
        let trusted = userModels.find((user) => user.id === trustedId);
        return trusted.trusters.add(truster);
    }

    async removeTrust(trusterId: number, trustedId: number): Promise<boolean> {
        const find = promisify(this._UserModel.find, this._UserModel);

        const userModels: Array<IUserInstance> = await find({
            where: { id: { inq: [trusterId, trustedId] } }
        });

        let truster = userModels.find((user) => user.id === trusterId);
        let trusted = userModels.find((user) => user.id === trustedId);
        return trusted.trusters.remove(truster);
    }

    async create(email: string, password: string, displayName: string): Promise<IUser> {
        const createUser = promisify(this._UserModel.create, this._UserModel);
        const user = await createUser({email, password, displayName});
        return user;
    }
}
