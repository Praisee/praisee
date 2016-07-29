import {
    authorizer,
    TOptionalUser,
    NotOwnerError,
    NotAuthenticatedError
} from 'pz-server/src/support/authorization';

import {ICommunityItems, ICommunityItem} from 'pz-server/src/community-items/community-items';

export interface IAuthorizedCommunityItems {
    findById(id: number): Promise<ICommunityItem>
    create(communityItem: ICommunityItem): Promise<ICommunityItem>
    update(communityItem: ICommunityItem): Promise<ICommunityItem>
}

class AuthorizedCommunityItems implements IAuthorizedCommunityItems {
    private _user: TOptionalUser;
    private _communityItems: ICommunityItems;

    constructor(user: TOptionalUser, communityItems: ICommunityItems) {
        this._user = user;
        this._communityItems = communityItems;
    }

    findById(id) {
        return this._communityItems.findById(id);
    }

    create(communityItem) {
        if (!this._user) {
            throw new NotAuthenticatedError();
        }

        return this._communityItems.create(communityItem);
    }

    async update(communityItem) {
        if (!this._user) {
            throw new NotAuthenticatedError();
        }

        const isOwner = await this._communityItems.isOwner(
            this._user.id, communityItem.id
        );

        if (!isOwner) {
            throw new NotOwnerError();
        }

        return await this._communityItems.update(communityItem);
    }
}

export default authorizer<IAuthorizedCommunityItems>(AuthorizedCommunityItems);
