import {ICommunityItems, ICommunityItem} from 'pz-server/src/community-items/community-items';
import {
    IDataToTextConverter,
    IContentData,
    isDraftJs08Content,
    IDraftjs08Content
} from 'pz-server/src/content/content-data';
import {ITopic, ITopics} from 'pz-server/src/topics/topics';
import {TBiCursor, ICursorResults} from 'pz-server/src/support/cursors/cursors';
import {IContentFilterer} from 'pz-server/src/content/content-filterer';
import {promisedMapCursorResults} from 'pz-server/src/support/cursors/map-cursor-results';
import {IComment} from 'pz-server/src/comments/comments';
import {IVote} from 'pz-server/src/votes/votes';
import {IPhotos, IPhoto} from 'pz-server/src/photos/photos';
import {filterAttachments} from '../content/filters/attachment-data';
import {IAttachment} from 'pz-client/src/editor/attachment-plugin/attachment';
import {TOptionalUser} from '../users/users';

export default class FilteredTopics implements ITopics {
    private _topics: ITopics;
    private _contentFilterer: IContentFilterer;

    constructor(topics: ITopics, contentFilterer: IContentFilterer) {
        this._topics = topics;
        this._contentFilterer = contentFilterer;
    }
    findAll(): Promise<Array<ITopic>> {
        return this._topics.findAll();
    }

    findById(id: number): Promise<ITopic> {
        return this._topics.findById(id);
    }

    findAllByIds(ids: Array<number>): Promise<Array<ITopic>> {
        return this._topics.findAllByIds(ids);
    }

    findByUrlSlugName(urlSlugName: string): Promise<ITopic> {
        return this._topics.findByUrlSlugName(urlSlugName);
    }

    async findSomeCommunityItemsRanked(topicId: number, asUser: TOptionalUser, cursor: TBiCursor): Promise<ICursorResults<ICommunityItem>> {
        const filteredCursorResults = await promisedMapCursorResults(
            await this._topics.findSomeCommunityItemsRanked(topicId, asUser, cursor),
            async (cursorResult) => Object.assign({}, cursorResult, {
                item: await this._filterCommunityItemBeforeRead(cursorResult.item)
            })
        );

        return filteredCursorResults;
    }

    findSomePhotoGalleryPhotosRanked(topicId: number, asUser: TOptionalUser, cursor: TBiCursor): Promise<ICursorResults<IPhoto>> {
        return this._topics.findSomePhotoGalleryPhotosRanked(topicId, asUser, cursor);
    }

    findAllCommunityItemIds(topicId: number): Promise<Array<number>> {
        return this._topics.findAllCommunityItemIds(topicId);
    }

    getCommunityItemCount(topicId: number): Promise<number> {
        return this._topics.getCommunityItemCount(topicId);
    }

    async _filterCommunityItemBeforeRead(communityItem: ICommunityItem): Promise<ICommunityItem> {
        const filteredBodyData = await this._contentFilterer.filterBeforeRead(
            communityItem.bodyData
        );

        return Object.assign({}, communityItem, {
            bodyData: filteredBodyData
        });
    }
}
