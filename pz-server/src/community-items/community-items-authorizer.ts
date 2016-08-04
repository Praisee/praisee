import {
    authorizer,
    TOptionalUser,
    NotOwnerError,
    NotAuthenticatedError,
    AuthorizationError
} from 'pz-server/src/support/authorization';

import {ITopic} from 'pz-server/src/topics/topics';

import {ICommunityItems, ICommunityItem} from 'pz-server/src/community-items/community-items';
import {TBiCursor, ICursorResults} from 'pz-server/src/support/cursors/cursors';

export interface IAuthorizedCommunityItems {
    findById(id: number): Promise<ICommunityItem>
    findSomeByCurrentUser(cursor: TBiCursor): Promise<ICursorResults<ICommunityItem>>
    findAllTopics(): Promise<Array<ITopic>>
    create(communityItem: ICommunityItem): Promise<ICommunityItem | AuthorizationError>
    update(communityItem: ICommunityItem): Promise<ICommunityItem | AuthorizationError>
}

class AuthorizedCommunityItems implements IAuthorizedCommunityItems {
    private _user: TOptionalUser;
    private _communityItems: ICommunityItems;

    constructor(user: TOptionalUser, communityItems: ICommunityItems) {
        this._user = user;
        this._communityItems = communityItems;
    }

    async findById(id: number): Promise<ICommunityItem> {
        return await this._communityItems.findById(id);
    }

    async findSomeByCurrentUser(cursor: TBiCursor): Promise<ICursorResults<ICommunityItem>> {
        if (!this._user) {
            return {results: []};
        }

        return await this._communityItems.findSomeByUserId(cursor, this._user.id);
    }

    async findAllTopics(): Promise<Array<ITopic>>{
        return await this._communityItems.findAllTopics();
    }

    async create(communityItem): Promise<ICommunityItem | AuthorizationError> {
        if (!this._user) {
            return new NotAuthenticatedError();
        }

        return await this._communityItems.create(communityItem, this._user.id);
    }

    async update(communityItem): Promise<ICommunityItem | AuthorizationError> {
        if (!this._user) {
            return new NotAuthenticatedError();
        }

        const isOwner = await this._communityItems.isOwner(
            this._user.id, communityItem.id
        );

        if (!isOwner) {
            return new NotOwnerError();
        }

        return await this._communityItems.update(communityItem);
    }
}

export default authorizer<IAuthorizedCommunityItems>(AuthorizedCommunityItems);
