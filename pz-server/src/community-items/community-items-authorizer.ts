import {
    authorizer,
    TOptionalUser,
    NotOwnerError,
    NotAuthenticatedError,
    AuthorizationError
} from 'pz-server/src/support/authorization';

import {ITopic} from 'pz-server/src/topics/topics';
import {IVote} from 'pz-server/src/votes/votes';

import {
    ICommunityItems,
    ICommunityItem,
    ICommunityItemInteraction
} from 'pz-server/src/community-items/community-items';
import {
    TBiCursor, ICursorResults,
    createEmptyCursorResults
} from 'pz-server/src/support/cursors/cursors';
import {IComment} from 'pz-server/src/comments/comments';
import {IPhoto} from 'pz-server/src/photos/photos';
import {IContentData} from 'pz-server/src/content/content-data';

export interface IAuthorizedCommunityItems {
    findById(id: number): Promise<ICommunityItem>
    findSomeByLatest(cursor: TBiCursor): Promise<ICursorResults<ICommunityItem>>
    findSomeByCurrentUser(cursor: TBiCursor): Promise<ICursorResults<ICommunityItem>>
    findSomeByUserId(cursor: TBiCursor, userId: number): Promise<ICursorResults<ICommunityItem>>
    findAllComments(communityItemId: number): Promise<Array<IComment>>
    findAllTopics(communityItemId: number): Promise<Array<ITopic>>
    findVotesForCommunityItem(communityItemId: number): Promise<Array<IVote>>
    findByUrlSlugName(fullSlug: string): Promise<ICommunityItem>
    findInteraction(communityItemId: number): Promise<ICommunityItemInteraction>
    findAllPhotosByBodyData(bodyData: IContentData): Promise<Array<IPhoto>>
    getReputationEarned(communityItemId: number): Promise<number | AuthorizationError>
    create(communityItem: ICommunityItem): Promise<ICommunityItem | AuthorizationError>
    update(communityItem: ICommunityItem): Promise<ICommunityItem | AuthorizationError>
    updateInteraction(interaction: ICommunityItemInteraction): Promise<ICommunityItemInteraction | NotAuthenticatedError>
    destroy(communityItem: ICommunityItem): Promise<void | AuthorizationError>
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

    async findSomeByLatest(cursor: TBiCursor): Promise<ICursorResults<ICommunityItem>> {
        if (!this._user || !this._user.isAdmin) {
            return createEmptyCursorResults<ICommunityItem>();
        }

        return this._communityItems.findSomeByLatest(cursor);
    }

    async findSomeByCurrentUser(cursor: TBiCursor): Promise<ICursorResults<ICommunityItem>> {
        if (!this._user) {
            return { results: [] };
        }

        return await this._communityItems.findSomeByUserId(cursor, this._user.id);
    }

    async findSomeByUserId(cursor: TBiCursor, userId: number): Promise<ICursorResults<ICommunityItem>> {
        return await this._communityItems.findSomeByUserId(cursor, userId);
    }
    
    async findAllTopics(communityItemId: number): Promise<Array<ITopic>> {
        return await this._communityItems.findAllTopics(communityItemId);
    }

    async findAllComments(communityItemId: number): Promise<Array<IComment>> {
        return await this._communityItems.findAllComments(communityItemId);
    }

    async findVotesForCommunityItem(communityItemId: number): Promise<Array<IVote>> {
        return await this._communityItems.findVotesForCommunityItem(communityItemId);
    }

    async findByUrlSlugName(fullSlug: string): Promise<ICommunityItem> {
        return await this._communityItems.findByUrlSlugName(fullSlug);
    }

    findAllPhotosByBodyData(bodyData: IContentData): Promise<Array<IPhoto>> {
        return this._communityItems.findAllPhotosByBodyData(bodyData);
    }

    async getReputationEarned(communityItemId: number): Promise<number> {
        if (!this._user) {
            return null;
        }
        return await this._communityItems.getReputationEarned(communityItemId, this._user.id);
    }

    async findInteraction(communityItemId: number): Promise<ICommunityItemInteraction> {
        if (!this._user) {
            return null;
        }

        return this._communityItems.findInteraction(communityItemId, this._user.id);
    }

    async create(communityItem): Promise<ICommunityItem | AuthorizationError> {
        if (!this._user) {
            return new NotAuthenticatedError();
        }

        return await this._communityItems.create(communityItem, this._user.id);
    }

    async update(communityItem): Promise<ICommunityItem | AuthorizationError> {
        const authorizationError = await getUpdateError(
            communityItem.id,
            this._user,
            this._communityItems
        );

        if (authorizationError) {
            return authorizationError;
        }

        return await this._communityItems.update(communityItem);
    }

    async updateInteraction(interaction: ICommunityItemInteraction): Promise<ICommunityItemInteraction | NotAuthenticatedError> {
        if (!this._user) {
            return new NotAuthenticatedError();
        }

        return this._communityItems.updateInteraction(Object.assign({}, interaction, {
            userId: this._user.id,
        }));
    }

    async destroy(communityItem: ICommunityItem): Promise<void | AuthorizationError> {
        const authorizationError = await getUpdateError(
            communityItem.id,
            this._user,
            this._communityItems
        );

        if (authorizationError) {
            return authorizationError;
        }

        return this._communityItems.destroy(communityItem);
    }
}

export default authorizer<IAuthorizedCommunityItems>(AuthorizedCommunityItems);

export async function getUpdateError(communityItemId: number, asUser: TOptionalUser, communityItems: ICommunityItems): Promise<AuthorizationError | null> {
    if (!asUser) {
        return new NotAuthenticatedError();
    }

    const isOwner = await communityItems.isOwner(
        asUser.id, communityItemId
    );

    if (!isOwner) {
        return new NotOwnerError();
    }

    return null;
}
