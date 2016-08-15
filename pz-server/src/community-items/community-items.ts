import {
    IRepository,
    IRepositoryRecord,
    createRecordFromLoopback
} from 'pz-server/src/support/repository';

import promisify from 'pz-support/src/promisify';

import {ITopic} from 'pz-server/src/topics/topics';
import isOwnerOfModel from 'pz-server/src/support/is-owner-of-model';
import {ICommunityItem as ILoopbackCommunityItem} from 'pz-server/src/models/community-item'

import {
    ICursorResults, TBiCursor
} from 'pz-server/src/support/cursors/cursors';

import {findWithCursor} from 'pz-server/src/support/cursors/loopback-helpers';
import {cursorLoopbackModelsToRecords} from 'pz-server/src/support/cursors/repository-helpers';
import {IContentData} from 'pz-server/src/content/content-data';

export type TCommunityItemType = (
    'review'
    | 'question'
    | 'howto'
    | 'comparison'
);

export interface ICommunityItem extends IRepositoryRecord {
    recordType: 'CommunityItem'

    id?: number
    type?: TCommunityItemType
    summary?: string
    body?: string
    bodyData?: IContentData
    createdAt?: Date
    updatedAt?: Date
}

export interface ICommunityItems extends IRepository {
    findById(id: number): Promise<ICommunityItem>
    findAllByIds(ids: Array<number>): Promise<Array<ICommunityItem>>
    findSomeByUserId(cursor: TBiCursor, userId: number): Promise<ICursorResults<ICommunityItem>>
    findAllTopics(): Promise<Array<ITopic>>
    isOwner(userId: number, communityItemId: number): Promise<boolean>
    create(communityItem: ICommunityItem, ownerId: number): Promise<ICommunityItem>
    update(communityItem: ICommunityItem): Promise<ICommunityItem>
}

export default class CommunityItems implements ICommunityItems {
    private _CommunityItemModel: ILoopbackCommunityItem;

    constructor(CommunityItemModel: ILoopbackCommunityItem) {
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

    async findAllByIds(ids: Array<number>): Promise<Array<ICommunityItem>> {
        const find = promisify(this._CommunityItemModel.find, this._CommunityItemModel);

        const communityItemModels = await find({
            where: { id: {inq: ids} }
        });

        return communityItemModels.map(communityItemModel => {
            return createRecordFromLoopback<ICommunityItem>('CommunityItem', communityItemModel);
        });
    }

    async findSomeByUserId(cursor: TBiCursor, userId: number): Promise<ICursorResults<ICommunityItem>> {
        const cursorResults = await findWithCursor(
            this._CommunityItemModel,
            cursor,
            { where: { userId } }
        );

        return cursorLoopbackModelsToRecords<ICommunityItem>('CommunityItem', cursorResults);
    }

    isOwner(userId: number, communityItemId: number): Promise<boolean> {
        return isOwnerOfModel(userId, this._CommunityItemModel, communityItemId);
    }

    async findAllTopics(): Promise<Array<ITopic>> {
        const topicModels = await promisify(
            this._CommunityItemModel.topics, this._CommunityItemModel)({});

        return topicModels.map((topic) =>
            createRecordFromLoopback<ITopic>('Topic', topic)
        );
    }

    async create(communityItem: ICommunityItem, ownerId: number): Promise<ICommunityItem> {
        let communityItemModel = new this._CommunityItemModel({
            type: communityItem.type,
            summary: communityItem.summary,
            body: communityItem.body,
            bodyData: communityItem.bodyData,
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
            body: communityItem.body,
            bodyData: communityItem.bodyData
        });

        const result = await promisify(communityItemModel.save, communityItemModel)();
        return createRecordFromLoopback<ICommunityItem>('CommunityItem', result);
    }
}

