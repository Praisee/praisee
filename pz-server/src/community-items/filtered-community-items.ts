import {ICommunityItems, ICommunityItem} from 'pz-server/src/community-items/community-items';
import {IDataToTextConverter} from 'pz-server/src/content/content-data';
import {ITopic} from 'pz-server/src/topics/topics';
import {TBiCursor, ICursorResults} from 'pz-server/src/support/cursors/cursors';
import {IContentFilterer} from 'pz-server/src/content/content-filterer';
import {promisedMapCursorResults} from 'pz-server/src/support/cursors/map-cursor-results';
import {IComment} from 'pz-server/src/comments/comments';

export default class FilteredCommunityItems implements ICommunityItems {
    private _CommunityItems: ICommunityItems;
    private _contentFilterer: IContentFilterer;
    private _convertBodyDataToText: IDataToTextConverter;

    constructor(CommunityItems: ICommunityItems, contentFilterer: IContentFilterer, convertBodyDataToText: IDataToTextConverter) {
        this._CommunityItems = CommunityItems;
        this._contentFilterer = contentFilterer;
        this._convertBodyDataToText = convertBodyDataToText;
    }

    async findById(id: number): Promise<ICommunityItem> {
        const communityItem = await this._CommunityItems.findById(id);
        return await this._filterBeforeRead(communityItem);
    }

    async findAllByIds(ids: Array<number>): Promise<Array<ICommunityItem>> {
        const communityItems = await this._CommunityItems.findAllByIds(ids);

        return await Promise.all<ICommunityItem>(communityItems.map(async (communityItem) => {
            return await this._filterBeforeRead(communityItem);
        }));
    }

    async findSomeByUserId(cursor: TBiCursor, userId: number): Promise<ICursorResults<ICommunityItem>> {
        const filteredCursorResults = await promisedMapCursorResults(
            await this._CommunityItems.findSomeByUserId(cursor, userId),
            async (cursorResult) => Object.assign({}, cursorResult, {
                item: await this._filterBeforeRead(cursorResult.item)
            })
        );

        return filteredCursorResults;
    }

    async isOwner(userId: number, communityItemId: number): Promise<boolean> {
        return await this._CommunityItems.isOwner(userId, communityItemId);
    }

    async findAllTopics(communityItemId: number): Promise<Array<ITopic>> {
        return await this._CommunityItems.findAllTopics(communityItemId);
    }

    async findAllComments(communityItemId: number): Promise<Array<IComment>> {
        return await this._CommunityItems.findAllComments(communityItemId);
    }

    async create(communityItem: ICommunityItem, ownerId: number): Promise<ICommunityItem> {
        const filteredCommunityItem = await this._filterBeforeWrite(communityItem);
        const newCommunityItem = await this._CommunityItems.create(filteredCommunityItem, ownerId);
        return await this._filterBeforeRead(newCommunityItem);
    }

    async update(communityItem: ICommunityItem): Promise<ICommunityItem> {
        const filteredCommunityItem = await this._filterBeforeWrite(communityItem);
        const updatedCommunityItem = await this._CommunityItems.update(filteredCommunityItem);
        return await this._filterBeforeRead(updatedCommunityItem);
    }

    async _filterBeforeRead(communityItem: ICommunityItem): Promise<ICommunityItem> {
        const filteredBodyData = await this._contentFilterer.filterBeforeRead(
            communityItem.bodyData
        );

        return Object.assign({}, communityItem, {
            bodyData: filteredBodyData
        });
    }

    async _filterBeforeWrite(communityItem: ICommunityItem): Promise<ICommunityItem> {
        const filteredBodyData = await this._contentFilterer.filterBeforeWrite(
            communityItem.bodyData
        );

        return Object.assign({}, communityItem, {
            body: this._convertBodyDataToText(filteredBodyData),
            bodyData: filteredBodyData
        });
    }
}
