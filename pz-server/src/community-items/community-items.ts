import {
    IRepository,
    IRepositoryRecord,
    createRecordFromLoopback
} from 'pz-server/src/support/repository';

import promisify from 'pz-support/src/promisify';

import {ISluggable} from 'pz-server/src/url-slugs/mixins/sluggable';
import isOwnerOfModel from 'pz-server/src/support/is-owner-of-model';

import {
    IForwardCursor, ICursorResults, fromDateCursor,
    shouldSkipAfter, toDateCursor
} from 'pz-server/src/support/cursors';

export type TCommunityItemType = (
    'review'
    | 'question'
    | 'howto'
    | 'comparison'
);

export interface ICommunityItem extends IRepositoryRecord {
    recordType: 'CommunityItem'

    id?: number
    type: TCommunityItemType
    summary: string,
    body: string,
    createdAt?: Date,
    updatedAt?: Date
}

export interface ICommunityItems extends IRepository {
    findById(id: number): Promise<ICommunityItem>
    findSomeByUserId(cursor: IForwardCursor, userId: number): Promise<ICursorResults<ICommunityItem>>
    isOwner(userId: number, communityItemId: number): Promise<boolean>
    create(communityItem: ICommunityItem, ownerId: number): Promise<ICommunityItem>
    update(communityItem: ICommunityItem): Promise<ICommunityItem>
}

export default class CommunityItems implements ICommunityItems {
    private _CommunityItemModel: IPersistedModel & ISluggable;

    constructor(CommunityItemModel: IPersistedModel & ISluggable) {
        this._CommunityItemModel = CommunityItemModel;
    }

    async findById(id: number): Promise<ICommunityItem> {
        const communityItemModel = await promisify(
            this._CommunityItemModel.findById, this._CommunityItemModel)(id);

        if (!communityItemModel) {
            return null;
        }

        return createRecordFromLoopback<ICommunityItem>('CommunityItem', communityItemModel);
    }

    async findSomeByUserId(cursor: IForwardCursor, userId: number): Promise<ICursorResults<ICommunityItem>> {
        let query: any = { where: { userId }, limit: cursor.take, order: 'createdAt' };

        if (shouldSkipAfter(cursor)) {
            query.where.createdAt = {gt: fromDateCursor(cursor.skipAfter)};
        }

        const communityItemModels = await promisify(
            this._CommunityItemModel.find, this._CommunityItemModel)(query);

        return this._modelsToCursorResults(communityItemModels);
    }

    isOwner(userId: number, communityItemId: number): Promise<boolean> {
        return isOwnerOfModel(userId, this._CommunityItemModel, communityItemId);
    }

    async create(communityItem: ICommunityItem, ownerId: number): Promise<ICommunityItem> {
        let communityItemModel = new this._CommunityItemModel({
            type: communityItem.type,
            summary: communityItem.summary,
            body: communityItem.body,
            userId: ownerId
        });

        const result = await promisify(communityItemModel.save, communityItemModel)();
        return createRecordFromLoopback<ICommunityItem>('CommunityItem', result);
    }

    async update(communityItem: ICommunityItem): Promise<ICommunityItem> {
        if (!communityItem.id) {
            throw new Error('Cannot update record without an id');
        }

        let communityItemModel = new this._CommunityItemModel({
            id: communityItem.id,
            type: communityItem.type,
            summary: communityItem.summary,
            body: communityItem.body
        });

        const result = await promisify(communityItemModel.save, communityItemModel)();
        return createRecordFromLoopback<ICommunityItem>('CommunityItem', result);
    }

    _modelsToCursorResults(models: Array<IPersistedModelInstance>): ICursorResults<ICommunityItem> {
        const results = models.map(model => {
            const record = createRecordFromLoopback<ICommunityItem>('CommunityItem', model);

            return {
                cursor: toDateCursor((model as any).createdAt),
                item: record
            };
        });

        return {
            results,
            hasNextPage: false //TODO:
        }
    }
}

