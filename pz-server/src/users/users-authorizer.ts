import {
    authorizer,
    TOptionalUser,
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
    findOtherUserById(userId: number): Promise<IOtherUser>
    create(email, password, displayName): Promise<IUser>
}

class AuthorizedUsers {
    private _user: TOptionalUser;
    private _users: IUsers;

    constructor(user: TOptionalUser, users: IUsers) {
        this._user = user;
        this._users = users;
    }

    async findOtherUserById(userId) {
        const {id, displayName} = await this._users.findById(userId);

        const otherUser: IOtherUser = {
            id,
            displayName,
            recordType: 'OtherUser'
        };

        return otherUser;
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

    create(email: string, password: string, displayName: string): Promise<IUser> {
        if (this._user) {
            return this.findById(this._user.id);
        }

        return this._users.create(email, password, displayName);
    }
}

export default authorizer<IAuthorizedUsers>(AuthorizedUsers);
