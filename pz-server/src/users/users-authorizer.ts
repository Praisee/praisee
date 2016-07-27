import {
    authorizer,
    TOptionalUser,
    IAuthorizer
} from 'pz-server/src/support/authorization';

import {IUsers, IUser} from 'pz-server/src/users/users';

export interface IAuthorizedUsers extends IUsers {
    findCurrentUser(): Promise<IUser>
}

class AuthorizedUsers {
    private _user: TOptionalUser;
    private _users: IUsers;

    constructor(user: TOptionalUser, users: IUsers) {
        this._user = user;
        this._users = users;
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
}

export default authorizer<IAuthorizedUsers>(AuthorizedUsers);
