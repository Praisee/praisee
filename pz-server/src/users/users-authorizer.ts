import {IUserInstance} from '../models/user';
import {
    authorizer,
    TOptionalUser,
    NotOwnerError,
    NotAuthenticatedError,
    AuthorizationError,
    IAuthorizer
} from 'pz-server/src/support/authorization';

import {IUsers, IUser, IOtherUser} from 'pz-server/src/users/users';

export interface IAuthorizedUsers {
    findById(userId: number): Promise<IUser>
    findCurrentUser(): Promise<IUser>
    findUserById(userId: number): Promise<IOtherUser | IUser>
    findByUrlSlugName(urlSlug: string): Promise<IOtherUser | IUser>
    getActivityStats(userId: number): Promise<any>
    getTotalTrusters(userId: number): Promise<number>
    getReputation(userId: number): Promise<number>
    toggleTrust(trustedId: number): Promise<boolean | AuthorizationError>
    isUserTrusting(queriedUserId: number): Promise<boolean>
    create(email, password, displayName): Promise<IUser>
    update(user): Promise<IUser | AuthorizationError>
}

class AuthorizedUsers {
    private _user: TOptionalUser;
    private _users: IUsers;

    constructor(user: TOptionalUser, users: IUsers) {
        this._user = user;
        this._users = users;
    }

    /* TODO: Name this something clever to indicate that it returns OtherUser if
             asking for a user other than the current user. This method is used by
             Community Items and Comments to help determine if the person viewing the
             content owns it or not. Should this logic just be in FindById? */
    async findUserById(userId): Promise<IOtherUser | IUser> {
        const user = await this._users.findById(userId);

        if (this._user && this._user.id === user.id) {
            user.recordType = 'CurrentUser';
            return user;
        }

        else {
            const otherUser: IOtherUser = {
                id: user.id,
                displayName: user.displayName,
                email: user.email,
                recordType: 'OtherUser'
            };

            return otherUser;
        }
    }

    findById(userId) {
        if (!this._user || this._user.id !== userId) {
            return null;
        }

        return this._users.findById(userId);
    }

    findCurrentUser() {
        if (!this._user) {
            return null;
        }

        return this.findById(this._user.id);
    }

    getActivityStats(userId: number) {
        return this._users.getActivityStats(userId);
    }

    async findByUrlSlugName(fullSlug: string): Promise<IOtherUser | IUser> {
        return this._users.findByUrlSlugName(fullSlug);
    }
    
    getTotalTrusters(userId: number): Promise<number> {
        return this._users.getTotalTrusters(userId);
    }

    getReputation(userId: number): Promise<number> {
        return this._users.getReputation(userId);
    }

    async toggleTrust(trustedId: number): Promise<boolean | AuthorizationError> {
        if (!this._user) {
            return new NotAuthenticatedError();
        }

        let isUserTrusting = await this.isUserTrusting(trustedId);
        if (isUserTrusting) {
            return this._users.removeTrust(this._user.id, trustedId);
        }
        else {
            return this._users.addTrust(this._user.id, trustedId);
        }
    }

    async isUserTrusting(queriedUserId: number): Promise<boolean> {
        if (!this._user) {
            return Promise.resolve(false);
        }

        return await this._users.isUserTrusting(this._user.id, queriedUserId);
    }

    create(email: string, password: string, displayName: string): Promise<IUser> {
        if (this._user) {
            return this.findById(this._user.id);
        }

        return this._users.create(email, password, displayName);
    }

    async update(user: IUser): Promise<IUser | AuthorizationError> {
        if (!this._user || this._user.id !== user.id) {
            return new NotAuthenticatedError();
        }

        return await this._users.update(user);
    }
}

export default authorizer<IAuthorizedUsers>(AuthorizedUsers);
