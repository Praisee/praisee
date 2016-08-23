import {createRecordFromLoopback} from 'pz-server/src/support/repository';

import promisify from 'pz-support/src/promisify';
import isOwnerOfModel from 'pz-server/src/support/is-owner-of-model';
import {ICommunityItem, ICommunityItems} from 'pz-server/src/community-items/community-items';
import {ITopicInstance} from 'pz-server/src/models/topic';
import {ITopic} from 'pz-server/src/topics/topics';
import {IComment} from 'pz-server/src/comments/comments';
import {ICommunityItemModel, ICommunityItemInstance} from 'pz-server/src/models/community-item';
import {IVote} from 'pz-server/src/votes/votes';
import {IVoteInstance} from 'pz-server/src/models/vote';

import {ICursorResults, TBiCursor} from 'pz-server/src/support/cursors/cursors';

import {findWithCursor} from 'pz-server/src/support/cursors/loopback-helpers';
import {mapCursorResult} from 'pz-server/src/support/cursors/map-cursor-results';

export function createRecordFromLoopbackCommunityItem(communityItem: ICommunityItemInstance): ICommunityItem {
    return createRecordFromLoopback<ICommunityItem>('CommunityItem', communityItem);
}

export default class CommunityItems implements ICommunityItems {
    private _CommunityItemModel: ICommunityItemModel;

    constructor(CommunityItemModel: ICommunityItemModel) {
        this._CommunityItemModel = CommunityItemModel;
    }

    async findById(id: number): Promise<ICommunityItem> {
        const communityItemModel = await promisify(
            this._CommunityItemModel.findById, this._CommunityItemModel)(id);

        if (!communityItemModel) {
            return null;
        }

        return createRecordFromLoopbackCommunityItem(communityItemModel);
    }

    async findAllByIds(ids: Array<number>): Promise<Array<ICommunityItem>> {
        const find = promisify(this._CommunityItemModel.find, this._CommunityItemModel);

        const communityItemModels = await find({
            where: { id: {inq: ids} }
        });

        return communityItemModels.map(communityItemModel => {
            return createRecordFromLoopbackCommunityItem(communityItemModel);
        });
    }

    async findSomeByUserId(cursor: TBiCursor, userId: number): Promise<ICursorResults<ICommunityItem>> {
        const cursorResults = await findWithCursor<ICommunityItemInstance>(
            this._CommunityItemModel,
            cursor,
            { where: { userId } }
        );

        return mapCursorResult<ICommunityItemInstance, ICommunityItem>(
            cursorResults,
            cursorResult => Object.assign({}, cursorResult, {
                item: createRecordFromLoopbackCommunityItem(cursorResult.item)
            }
        ));
    }

    async findVotesForCommunityItem(communityItemId: number): Promise<Array<IVote>> {
        const communityItemModel: ICommunityItemInstance = await promisify(
            this._CommunityItemModel.findById, this._CommunityItemModel)(communityItemId);

        const votes = await promisify<IVoteInstance[]>(
            communityItemModel.votes, communityItemModel)();

        return votes.map((vote) =>
            createRecordFromLoopback<IVote>('Vote', vote)
        );
    }

    isOwner(userId: number, communityItemId: number): Promise<boolean> {
        return isOwnerOfModel(userId, this._CommunityItemModel, communityItemId);
    }

    async findAllTopics(communityItemId: number): Promise<Array<ITopic>> {
        const communityItem: ICommunityItemInstance = await (promisify(
            this._CommunityItemModel.findById, this._CommunityItemModel)(communityItemId));

        const topicModels = await promisify<ITopicInstance[]>(
            communityItem.topics, communityItem)({});

        return topicModels.map((topic) =>
            createRecordFromLoopback<ITopic>('Topic', topic)
        );
    }

    async findAllComments(communityItemId: number): Promise<Array<IComment>> {
        const communityItemModel: ICommunityItemInstance = await promisify(
            this._CommunityItemModel.findById, this._CommunityItemModel)(communityItemId);

        const comments = await promisify(
            communityItemModel.comments, communityItemModel)();

        return comments.map((comment) =>
            createRecordFromLoopback<IComment>('Comment', comment)
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
        return createRecordFromLoopbackCommunityItem(result);
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
        return createRecordFromLoopbackCommunityItem(result);
    }
}

