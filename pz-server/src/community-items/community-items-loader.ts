import {
    ICommunityItems,
    ICommunityItem,
    ICommunityItemsBatchable
} from 'pz-server/src/community-items/community-items';

import {TBiCursor, ICursorResults} from 'pz-server/src/support/cursors/cursors';
import {ITopic} from 'pz-server/src/topics/topics';
import {IComment} from 'pz-server/src/comments/comments';
import {IVote} from 'pz-server/src/votes/votes';

import DataLoader from 'dataloader';
import createDataLoaderBatcher from 'pz-server/src/support/create-dataloader-batcher';

export default class CommunityItemsLoader implements ICommunityItems {
    private _communityItems: ICommunityItems & ICommunityItemsBatchable;

    private _loaders: {
        findAllByIds: DataLoader<number, ICommunityItem>
    };

    constructor(communityItems: ICommunityItems) {
        this._communityItems = communityItems;

        this._loaders = {
            findAllByIds: createDataLoaderBatcher<number, ICommunityItem>(
                this._communityItems.findAllByIds.bind(this._communityItems)
            )
        }
    }

    findById(id: number): Promise<ICommunityItem> {
        return this._loaders.findAllByIds.load(id);
    }

    findAllByIds(ids: Array<number>): Promise<Array<ICommunityItem>> {
        return this._loaders.findAllByIds.loadMany(ids);
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

    isOwner(userId: number, communityItemId: number): Promise<boolean> {
        return this._communityItems.isOwner(userId, communityItemId);
    }

    create(communityItem: ICommunityItem, ownerId: number): Promise<ICommunityItem> {
        return this._communityItems.create(communityItem, ownerId);
    }

    update(communityItem: ICommunityItem): Promise<ICommunityItem> {
        return this._communityItems.update(communityItem);
    }
}
