import {
    IVote,
    IVotes,
    IVoteAggregate,
    IVotesBatchable
} from 'pz-server/src/votes/votes';

import DataLoader from 'dataloader';
import {TBiCursor, ICursorResults} from 'pz-server/src/support/cursors/cursors';
import createDataLoaderBatcher from 'pz-server/src/support/create-dataloader-batcher';

export default class VotesLoader implements IVotes {
    private _votes: IVotes & IVotesBatchable;

    private _loaders: {
        findAllByIds: DataLoader<number, IVote>,
        getAllAggregatesForParents: DataLoader<[string, number], IVoteAggregate>
        getAllAggregatesForAffectedUsers: DataLoader<number, IVoteAggregate>
    };

    constructor(votes: IVotes & IVotesBatchable) {
        this._votes = votes;

        this._loaders = {
            findAllByIds: createDataLoaderBatcher(
                this._votes.findAllByIds.bind(this._votes)
            ),

            getAllAggregatesForParents: createDataLoaderBatcher(
                this._votes.getAllAggregatesForParents.bind(this._votes),
                {cacheKeyFn: ([parentType, parentId]) => `${parentType}:${parentId}`}
            ),

            getAllAggregatesForAffectedUsers: createDataLoaderBatcher(
                this._votes.getAllAggregatesForAffectedUsers.bind(this._votes)
            )
        }
    }

    findById(id: number): Promise<IVote> {
        return this._loaders.findAllByIds.load(id);
    }

    findAllByIds(ids: Array<number>): Promise<Array<IVote>> {
        return this._loaders.findAllByIds.loadMany(ids);
    }

    getAggregateForParent(parentType: string, parentId: number): Promise<IVoteAggregate> {
        return this._loaders.getAllAggregatesForParents.load([parentType, parentId]);
    }

    getAggregateForAffectedUser(userId: number): Promise<IVoteAggregate> {
        return this._loaders.getAllAggregatesForAffectedUsers.load(userId);
    }

    findSomeByUserId(cursor: TBiCursor, userId: number): Promise<ICursorResults<IVote>> {
        return this._votes.findSomeByUserId(cursor, userId);
    }

    findSomeByAffectedUserId(cursor: TBiCursor, affectedUserId: number): Promise<ICursorResults<IVote>> {
        return this._votes.findSomeByAffectedUserId(cursor, affectedUserId);
    }

    findOneByFilter(vote: IVote): Promise<IVote> {
        return this._votes.findOneByFilter(vote);
    }

    findAllByFilter(vote: IVote): Promise<Array<IVote>> {
        return this._votes.findAllByFilter(vote);
    }

    isOwner(userId: number, voteId: number): Promise<boolean> {
        return this._votes.isOwner(userId, voteId);
    }

    create(vote: IVote, ownerId: number): Promise<IVote> {
        return this._votes.create(vote, ownerId);
    }

    update(vote: IVote): Promise<IVote> {
        return this._votes.update(vote);
    }

    destroy(vote: IVote): Promise<boolean> {
        return this._votes.destroy(vote);
    }
}
