import {
    ICommunityItems,
    ICommunityItem,
    ICommunityItemsBatchable, ICommunityItemInteraction
} from 'pz-server/src/community-items/community-items';

import {TBiCursor, ICursorResults} from 'pz-server/src/support/cursors/cursors';
import {ITopic} from 'pz-server/src/topics/topics';
import {IComment} from 'pz-server/src/comments/comments';
import {IVote} from 'pz-server/src/votes/votes';

import DataLoader from 'dataloader';
import createDataLoaderBatcher from 'pz-server/src/support/create-dataloader-batcher';
import {IPhoto} from 'pz-server/src/photos/photos';
import {IContentData} from 'pz-server/src/content/content-data';

export default class CommunityItemsLoader implements ICommunityItems {
    private _communityItems: ICommunityItems & ICommunityItemsBatchable;

    private _loaders: {
        findAllByIds: DataLoader<number, ICommunityItem>
        findAllInteractionsForEach: DataLoader<[number, number], ICommunityItemInteraction>
    };

    constructor(communityItems: ICommunityItems & ICommunityItemsBatchable) {
        this._communityItems = communityItems;

        this._loaders = {
            findAllByIds: createDataLoaderBatcher<number, ICommunityItem>(
                this._communityItems.findAllByIds.bind(this._communityItems)
            ),

            findAllInteractionsForEach: createDataLoaderBatcher<[number, number], ICommunityItemInteraction>(
                this._communityItems.findAllInteractionsForEach.bind(this._communityItems)
            )
        }
    }

    findById(id: number): Promise<ICommunityItem> {
        return this._loaders.findAllByIds.load(id);
    }

    findAllByIds(ids: Array<number>): Promise<Array<ICommunityItem>> {
        return this._loaders.findAllByIds.loadMany(ids);
    }

    findSomeByLatest(cursor: TBiCursor): Promise<ICursorResults<ICommunityItem>> {
        return this._communityItems.findSomeByLatest(cursor);
    }

    findSomeByUserId(cursor: TBiCursor, userId: number): Promise<ICursorResults<ICommunityItem>> {
        return this._communityItems.findSomeByUserId(cursor, userId);
    }

    findAllTopics(communityItemId: number): Promise<Array<ITopic>> {
        return this._communityItems.findAllTopics(communityItemId);
    }

    findAllComments(communityItemId: number): Promise<Array<IComment>> {
        return this._communityItems.findAllComments(communityItemId);
    }

    findVotesForCommunityItem(communityItemId: number): Promise<Array<IVote>> {
        return this._communityItems.findVotesForCommunityItem(communityItemId);
    }

    findByUrlSlugName(fullSlug: string) : Promise<ICommunityItem>{
        return this._communityItems.findByUrlSlugName(fullSlug);
    }

    findInteraction(communityItemId: number, userId: number): Promise<ICommunityItemInteraction> {
        return this._loaders.findAllInteractionsForEach.load([communityItemId, userId]);
    }

    findAllPhotosByBodyData(bodyData: IContentData): Promise<Array<IPhoto>> {
        return this._communityItems.findAllPhotosByBodyData(bodyData);
    }

    getReputationEarned(communityItemId: number, userId: number): Promise<number>{
        return this._communityItems.getReputationEarned(communityItemId, userId);
    }

    isOwner(userId: number, communityItemId: number): Promise<boolean> {
        return this._communityItems.isOwner(userId, communityItemId);
    }

    create(communityItem: ICommunityItem, ownerId: number): Promise<ICommunityItem> {
        return this._communityItems.create(communityItem, ownerId);
    }

    update(communityItem: ICommunityItem): Promise<ICommunityItem> {
        return this._communityItems.update(communityItem);
    }

    updateInteraction(interaction: ICommunityItemInteraction): Promise<ICommunityItemInteraction> {
        return this._communityItems.updateInteraction(interaction);
    }

    destroy(communityItem: ICommunityItem): Promise<void> {
        return this._communityItems.destroy(communityItem);
    }
}
