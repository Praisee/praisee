import {
    IUser,
    IUsers,
    IUsersBatchable,
    IUserActivityStats,
    IAvatarInfo
} from 'pz-server/src/users/users';

import DataLoader from 'dataloader';
import createDataLoaderBatcher from 'pz-server/src/support/create-dataloader-batcher';

export default class UsersLoader implements IUsers {
    private _users: IUsers & IUsersBatchable;

    private _loaders: {
        findAllByIds: DataLoader<number, IUser>
    };

    constructor(users: IUsers & IUsersBatchable) {
        this._users = users;

        this._loaders = {
            findAllByIds: createDataLoaderBatcher(
                this._users.findAllByIds.bind(this._users)
            )
        }
    }

    findById(userId: number): Promise<IUser> {
        return this._loaders.findAllByIds.load(userId);
    }

    findByUrlSlugName(urlSlug: string): Promise<IUser> {
        return this._users.findByUrlSlugName(urlSlug);
    }

    getActivityStats(userId: number): Promise<number> {
        return this._users.getActivityStats(userId);
    }

    getTotalCommunityItems(userId: number): Promise<number> {
        return this._users.getTotalCommunityItems(userId);
    }

    getTotalTrusters(userId: number): Promise<number> {
        return this._users.getTotalTrusters(userId);
    }

    getAvatarInfo(userId: number): Promise<IAvatarInfo> {
        return this._users.getAvatarInfo(userId);
    }
    
    addTrust(trusterId: number, trustedId: number): Promise<boolean> {
        return this._users.addTrust(trusterId, trustedId);
    }

    getReputation(userId: number): Promise<number> {
        return this._users.getReputation(userId);
    }

    removeTrust(trusterId: number, trustedId: number): Promise<boolean> {
        return this._users.removeTrust(trusterId, trustedId);
    }

    isUserTrusting(trusterUserId: number, queriedUserId: number): Promise<boolean> {
        return this._users.isUserTrusting(trusterUserId, queriedUserId);
    }

    create(email: string, password: string, displayName: string): Promise<IUser> {
        return this._users.create(email, password, displayName);
    }

    update(user: IUser): Promise<IUser> {
        return this._users.update(user);
    }
}
