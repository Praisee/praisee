import {createRecordFromLoopback} from 'pz-server/src/support/repository';

import promisify from 'pz-support/src/promisify';
import isOwnerOfModel from 'pz-server/src/support/is-owner-of-model';
import {
    IVote,
    IVotes,
    IVoteAggregate,
    IVotesBatchable
} from 'pz-server/src/votes/votes';
import {IVoteInstance, IVoteModel} from 'pz-server/src/models/vote';

import {ICursorResults, TBiCursor} from 'pz-server/src/support/cursors/cursors';

import {findWithCursor} from 'pz-server/src/support/cursors/loopback-helpers';
import {cursorLoopbackModelsToRecords} from 'pz-server/src/support/cursors/repository-helpers';
import loopbackQuery from '../support/loopback-query';
import {loopbackFindAllByIds} from 'pz-server/src/support/loopback-find-all-helpers';

export function createRecordFromLoopbackVote(vote: IVoteInstance): IVote {
    return createRecordFromLoopback<IVote>('Vote', vote);
}

export function cursorVoteLoopbackModelsToRecords(votes: ICursorResults<IVoteInstance>): ICursorResults<IVote> {
    return cursorLoopbackModelsToRecords<IVote>('Vote', votes);
}

export default class LoopbackVotes implements IVotes, IVotesBatchable {
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
        const voteModels = await loopbackFindAllByIds<IVoteModel, IVoteInstance>(
            this._VoteModel,
            ids
        );

        return voteModels.map(VoteModel => {
            return createRecordFromLoopbackVote(VoteModel);
        });
    }

    async findOneByFilter(voteFilter: IVote): Promise<IVote> {
        let filters = Object.keys(voteFilter).map((key) => {
            return { [key]: voteFilter[key] }
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

    async findAllByFilter(voteFilter: IVote): Promise<Array<IVote>> {
        let filters = Object.keys(voteFilter).map((key) => {
            return { [key]: voteFilter[key] }
        });

        let where = { and: filters };

        const VoteModel = await promisify(this._VoteModel.find, this._VoteModel)(where);

        if (!VoteModel) {
            return null;
        }

        return VoteModel.map(vote => createRecordFromLoopbackVote(VoteModel));
    }

    async getAggregateForParent(parentType: string, parentId: number): Promise<IVoteAggregate> {
        const [voteAggregate] = await this._getAllAggregates(
            ['parentType', 'parentId'],
            [[parentType, parentId]]
        );

        return voteAggregate;
    }

    async getAggregateForAffectedUser(userId: number): Promise<IVoteAggregate> {
        const [voteAggregate] = await this._getAllAggregates(
            ['affectedUserId'],
            [userId]
        );

        return voteAggregate;
    }

    async getAllAggregatesForParents(parents: Array<[string, number]>): Promise<Array<IVoteAggregate>> {
        return await this._getAllAggregates(
            ['parentType', 'parentId'],
            parents
        );
    }

    async getAllAggregatesForAffectedUsers(userIds: Array<number>): Promise<Array<IVoteAggregate>> {
        return await this._getAllAggregates(
            ['affectedUserId'],
            userIds
        );
    }

    async findSomeByUserId(cursor: TBiCursor, userId: number): Promise<ICursorResults<IVote>> {
        const cursorResults = await findWithCursor<IVoteInstance>(
            this._VoteModel,
            cursor,
            { where: { userId } }
        );

        return cursorVoteLoopbackModelsToRecords(cursorResults);
    }

    async findSomeByAffectedUserId(cursor: TBiCursor, affectedUserId: number): Promise<ICursorResults<IVote>> {
        const cursorResults = await findWithCursor<IVoteInstance>(
            this._VoteModel,
            cursor,
            { where: { affectedUserId } }
        );

        return cursorVoteLoopbackModelsToRecords(cursorResults);
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

        let existingVote = await promisify(this._VoteModel.findById, this._VoteModel)(vote.id);

        existingVote.isUpVote = vote.isUpVote;

        const result = await promisify<IVoteInstance>(existingVote.save, existingVote)();
        return createRecordFromLoopbackVote(result);
    }

    async destroy(vote: IVote) {
        if (!vote.id) {
            throw new Error('Cannot delete record without an id');
        }

        let destoryPromise = promisify(this._VoteModel.destroyAll, this._VoteModel)({
            id: vote.id,
            userId: vote.userId
        });

        return await destoryPromise;
    }

    private async _getAllAggregates(
            unsafeFields: Array<string>, params: Array<any>
        ): Promise<Array<IVoteAggregate>> {

        const fieldsSql = unsafeFields.join(', ');

        let whereConditions = [];
        let whereValues = [];

        if (unsafeFields.length > 1) {
            let i = 0;

            params.forEach((param) => {
                const whereAnd = [];

                unsafeFields.forEach((field, index) => {
                    whereAnd.push(`${field} = $${++i}`);
                    whereValues.push(param[index]);
                });

                whereConditions.push(`(${whereAnd.join(' AND ')})`);
            });

        } else {

            const field = unsafeFields[0];

            const whereSql = params.length > 1 ?
                `${field} IN (${params.map((_, index) => '$' + (index + 1)).join(',')})`
                : `${field} = $1`;

            whereConditions = [whereSql];
            whereValues = params;
        }

        // Note: Loopback auto-lowercases everything (awesome!) so we need to assume
        // lowercase fields and aliases as a result.
        const query = `
            SELECT
                COUNT(*) AS total,
                SUM(CASE WHEN isupvote THEN 1 ELSE 0 END) as upvotes,
                ${fieldsSql}
            FROM vote
            WHERE
                ${whereConditions.join(' OR ')}
            GROUP BY ${fieldsSql}
        `;

        const results = await loopbackQuery(this._VoteModel, query, ...whereValues);

        const resultsMap = new Map();

        const resultToVoteAggregate = (result) => {
            if (!result) {
                return {
                    upVotes: 0,
                    downVotes: 0,
                    total: 0
                };
            }

            const total = Number(result.total);
            const upVotes = Number(result.upvotes); // Note, Loopback requires upVotes to be lowercase

            return {
                upVotes,
                downVotes: total - upVotes,
                total: total
            };
        };

        if (unsafeFields.length > 1) {
            results.forEach(result => {
                const fieldValues = unsafeFields.map(field => {
                    const dbField = field.toLowerCase(); // TODO: This will probably not be lowercased in the future

                    if (!(dbField in result)) {
                        throw new Error(`${dbField} is missing from votes aggregate result`);
                    }

                    return result[dbField];
                });

                resultsMap.set(fieldValues.join(':'), result);
            });

            return params.map(param => resultToVoteAggregate(resultsMap.get(param.join(':'))));

        } else {

            const field = unsafeFields[0];

            results.forEach(result => {
                const dbField = field.toLowerCase(); // TODO: This will probably not be lowercased in the future

                if (!(dbField in result)) {
                    throw new Error(`${dbField} is missing from votes aggregate result`);
                }

                resultsMap.set(result[dbField], result);
            });

            return params.map(param => resultToVoteAggregate(resultsMap.get(param)));
        }
    }
}

