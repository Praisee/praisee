import {
    authorizer,
    TOptionalUser,
    NotOwnerError,
    NotAuthenticatedError,
    AuthorizationError,
    IAuthorizer
} from 'pz-server/src/support/authorization';

import {IUsers, IUser} from 'pz-server/src/users/users';
import {
    IRepository, IRepositoryRecord, createRecordFromLoopback
} from 'pz-server/src/support/repository';

export interface IOtherUser extends IRepositoryRecord {
    recordType: 'OtherUser'
    id: number
    displayName: string
}

export interface IAuthorizedUsers {
    findById(userId: number): Promise<IUser>
    findCurrentUser(): Promise<IUser>
    findUserById(userId: number): Promise<IOtherUser | IUser>
    getTotalTrusters(userId: number): Promise<number>
    toggleTrust(trustedId: number): Promise<boolean | AuthorizationError>
    isUserTrusting(queriedUserId: number): Promise<boolean>
    create(email, password, displayName): Promise<IUser>
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

        if (this._user && this._user.id == user.id) {
            return user;
        }

        else {
            const otherUser: IOtherUser = {
                id: user.id,
                displayName: user.displayName,
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

    getTotalTrusters(userId: number): Promise<number> {
        return this._users.getTotalTrusters(userId);
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
}

export default authorizer<IAuthorizedUsers>(AuthorizedUsers);
