import {
    ICommunityItems,
    ICommunityItem
} from 'pz-server/src/community-items/community-items';

import {TBiCursor, ICursorResults} from 'pz-server/src/support/cursors/cursors';
import {ITopic} from 'pz-server/src/topics/topics';
import {IComment} from 'pz-server/src/comments/comments';
import {IVote} from 'pz-server/src/votes/votes';

import DataLoader from 'dataloader';

export default class CommunityItemsLoader implements ICommunityItems {
    private _communityItems: ICommunityItems;
    private _loaders: {
        communityItems: DataLoader<number, ICommunityItem>
    };

    constructor(communityItems: ICommunityItems) {
        this._communityItems = communityItems;

        this._loaders = {
            communityItems: new DataLoader(this._communityItemBatcher.bind(this))
        }
    }

    findById(id: number): Promise<ICommunityItem> {
        return this._loaders.communityItems.load(id);
    }

    findAllByIds(ids: Array<number>): Promise<Array<ICommunityItem>> {
        return this._loaders.communityItems.loadMany(ids);
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
        this._loaders.communityItems.clear(communityItem.id);
        return this._communityItems.update(communityItem);
    }

    private async _communityItemBatcher(ids: Array<number>): Promise<Array<ICommunityItem>> {
        if (ids.length > 1) {
            return this._communityItems.findAllByIds(ids);
        } else {
            return [await this._communityItems.findById(ids[0])];
        }
    }
}
