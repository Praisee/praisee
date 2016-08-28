import {createRecordFromLoopback} from 'pz-server/src/support/repository';

import promisify from 'pz-support/src/promisify';
import isOwnerOfModel from 'pz-server/src/support/is-owner-of-model';
import {IVote, IVotes, IVoteAggregate} from 'pz-server/src/votes/votes';
import {IVoteInstance, IVoteModel} from 'pz-server/src/models/vote';

import {ICursorResults, TBiCursor} from 'pz-server/src/support/cursors/cursors';

import {findWithCursor} from 'pz-server/src/support/cursors/loopback-helpers';
import {mapCursorResult} from 'pz-server/src/support/cursors/map-cursor-results';

export function createRecordFromLoopbackVote(vote: IVoteInstance): IVote {
    return createRecordFromLoopback<IVote>('Vote', vote);
}

export default class Votes implements IVotes {
    private _VoteModel: IVoteModel;

    constructor(VoteModel: IVoteModel) {
        this._VoteModel = VoteModel;
    }

    async findById(id: number): Promise<IVote> {
        const VoteModel = await promisify(
            this._VoteModel.findById, this._VoteModel)(id);

        if (!VoteModel) {
            return null;
        }

        return createRecordFromLoopbackVote(VoteModel);
    }

    async findAllByIds(ids: Array<number>): Promise<Array<IVote>> {
        const find = promisify(this._VoteModel.find, this._VoteModel);

        const VoteModels = await find({
            where: { id: { inq: ids } }
        });

        return VoteModels.map(VoteModel => {
            return createRecordFromLoopbackVote(VoteModel);
        });
    }

    async findOne(vote: IVote): Promise<IVote> {
        let filters = Object.keys(vote).map((key) => {
            return { [key]: vote[key] }
        });

        let where = { and: filters };

        const VoteModel = await promisify(this._VoteModel.findOne, this._VoteModel)(
            {
                where: where
            }
        );

        if (!VoteModel) {
            return null;
        }

        return createRecordFromLoopbackVote(VoteModel);
    }

    async getAggregateForParent(vote: IVote): Promise<IVoteAggregate> {
        let filters = Object.keys(vote).map((key) => {
            return { [key]: vote[key] }
        });

        let where = { and: filters };

        const count = await promisify(this._VoteModel.count, this._VoteModel)(where);

        filters.push({ isUpVote: true });

        const upVotes = await promisify(this._VoteModel.count, this._VoteModel)(where);

        return { upVotes, count };
    }

    async findMany(vote: IVote): Promise<Array<IVote>> {
        const VoteModel = await promisify(this._VoteModel.find, this._VoteModel)(
            {
                where: { vote }
            }
        );

        if (!VoteModel) {
            return null;
        }

        return VoteModel.map(vote => createRecordFromLoopbackVote(VoteModel));
    }

    async findSomeByUserId(cursor: TBiCursor, userId: number): Promise<ICursorResults<IVote>> {
        const cursorResults = await findWithCursor<IVoteInstance>(
            this._VoteModel,
            cursor,
            { where: { userId } }
        );

        return mapCursorResult<IVoteInstance, IVote>(
            cursorResults,
            cursorResult => Object.assign({}, cursorResult, {
                item: createRecordFromLoopbackVote(cursorResult.item)
            }
            ));
    }

    async findSomeByAffectedUserId(cursor: TBiCursor, affectedUserId: number): Promise<ICursorResults<IVote>> {
        const cursorResults = await findWithCursor<IVoteInstance>(
            this._VoteModel,
            cursor,
            { where: { affectedUserId } }
        );

        return mapCursorResult<IVoteInstance, IVote>(
            cursorResults,
            cursorResult => Object.assign({}, cursorResult, {
                item: createRecordFromLoopbackVote(cursorResult.item)
            }
            ));
    }

    isOwner(userId: number, voteId: number): Promise<boolean> {
        return isOwnerOfModel(userId, this._VoteModel, voteId);
    }

    async create(vote: IVote, ownerId: number): Promise<IVote> {
        let VoteModel = new this._VoteModel(vote);

        const result = await promisify(VoteModel.save, VoteModel)();
        return createRecordFromLoopbackVote(result);
    }

    async update(vote: IVote): Promise<IVote> {
        if (!vote.id) {
            throw new Error('Cannot update record without an id');
        }

        let VoteModel = new this._VoteModel({
            id: vote.id,
            userId: vote.userId,
            upVote: vote.isUpVote
        });

        const result = await promisify(VoteModel.save, VoteModel)();
        return createRecordFromLoopbackVote(result);
    }

    async delete(vote: IVote) {
        if (!vote.id) {
            throw new Error('Cannot delete record without an id');
        }

        let destoryPromise = promisify(this._VoteModel.destroyAll, this._VoteModel)({
            id: vote.id,
            userId: vote.userId
        });

        return await destoryPromise;
    }
}

