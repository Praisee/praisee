import {
    IRepository,
    IRepositoryRecord,
    createRecordFromLoopback
} from 'pz-server/src/support/repository';

import promisify from 'pz-support/src/promisify';

import {ISluggable} from 'pz-server/src/url-slugs/mixins/sluggable';
import isOwnerOfModel from 'pz-server/src/support/is-owner-of-model';

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
    isOwner(userId: number, communityItemId: number): Promise<boolean>
    create(communityItem: ICommunityItem): Promise<ICommunityItem>
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

    isOwner(userId: number, communityItemId: number): Promise<boolean> {
        return isOwnerOfModel(userId, this._CommunityItemModel, communityItemId);
    }

    async create(communityItem: ICommunityItem): Promise<ICommunityItem> {
        let communityItemModel = new this._CommunityItemModel({
            type: communityItem.type,
            summary: communityItem.summary,
            body: communityItem.body
        });

        const result = await promisify(communityItemModel.save, communityItem)();
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

        const result = await promisify(communityItemModel.save, communityItem)();
        return createRecordFromLoopback<ICommunityItem>('CommunityItem', result);
    }
}

