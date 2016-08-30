import {
    authorizer,
    TOptionalUser,
    NotOwnerError,
    NotAuthenticatedError,
    AuthorizationError
} from 'pz-server/src/support/authorization';

import {IVotes, IVote, IVoteAggregate} from 'pz-server/src/votes/votes';
import {TBiCursor, ICursorResults} from 'pz-server/src/support/cursors/cursors';

export interface IAuthorizedVotes {
    findById(id: number): Promise<IVote>
    findAllByIds(ids: Array<number>): Promise<Array<IVote>>
    findSomeByUserId(cursor: TBiCursor, userId: number): Promise<ICursorResults<IVote>>
    findSomeByAffectedUserId(cursor: TBiCursor, affectedUserId: number): Promise<ICursorResults<IVote>>
    findSomeByCurrentUser(cursor: TBiCursor): Promise<ICursorResults<IVote>>
    findCurrentUserVoteForParent(parentType: string, id: number): Promise<IVote | AuthorizationError>
    findAllVotesForParent(parentType: string, id: number): Promise<Array<IVote> | AuthorizationError>
    getAggregateForParent(parentType: string, id: number): Promise<IVoteAggregate>
    isOwner(userId: number, voteId: number): Promise<boolean>
    create(vote: IVote): Promise<IVote | AuthorizationError>
    update(vote: IVote): Promise<IVote | AuthorizationError>
    delete(vote: IVote): Promise<AuthorizationError>
}

class AuthorizedVotes implements IAuthorizedVotes {
    private _user: TOptionalUser;
    private _votes: IVotes;

    constructor(user: TOptionalUser, votes: IVotes) {
        this._user = user;
        this._votes = votes;
    }

    async findById(id: number): Promise<IVote> {
        return await this._votes.findById(id);
    }

    async findAllByIds(ids: Array<number>): Promise<Array<IVote>> {
        return await this._votes.findAllByIds(ids);
    }

    async findSomeByUserId(cursor: TBiCursor, userId: number): Promise<ICursorResults<IVote>> {
        if (!this._user) {
            return { results: [] };
        }

        return await this._votes.findSomeByUserId(cursor, this._user.id);
    }

    async findSomeByAffectedUserId(cursor: TBiCursor, affectedUserId: number): Promise<ICursorResults<IVote>> {
        if (!this._user) {
            return { results: [] };
        }

        return await this._votes.findSomeByUserId(cursor, this._user.id);
    }

    async findSomeByCurrentUser(cursor: TBiCursor): Promise<ICursorResults<IVote>> {
        if (!this._user) {
            return { results: [] };
        }

        return await this._votes.findSomeByUserId(cursor, this._user.id);
    }

    async isOwner(userId: number, voteId: number): Promise<boolean> {
        return await this._votes.isOwner(userId, voteId);
    }

    async findCurrentUserVoteForParent(parentType: string, id: number): Promise<IVote | AuthorizationError> {
        if (!this._user) {
            return new NotAuthenticatedError();
        }

        return await this._votes.findOneByFilter({
            recordType: "Vote",
            userId: this._user.id,
            parentType: parentType,
            parentId: id
        });
    }

    async findAllVotesForParent(parentType: string, id: number): Promise<Array<IVote> | AuthorizationError> {
        return await this._votes.findAllByFilter({
            recordType: "Vote",
            parentType: parentType,
            parentId: id
        });
    }

    async getAggregateForParent(parentType: string, id: number): Promise<IVoteAggregate> {
        return await this._votes.getAggregateForParent({
            recordType: "Vote",
            parentType: parentType,
            parentId: id
        });
    }

    async create(vote): Promise<IVote | AuthorizationError> {
        if (!this._user) {
            return new NotAuthenticatedError();
        }

        vote.userId = this._user.id;
        return await this._votes.create(vote, this._user.id);
    }

    async update(vote): Promise<IVote | AuthorizationError> {
        if (!this._user) {
            return new NotAuthenticatedError();
        }

        const isOwner = await this._votes.isOwner(
            this._user.id, vote.id
        );

        if (!isOwner) {
            return new NotOwnerError();
        }

        return await this._votes.update(vote);
    }

    async delete(vote): Promise<boolean | AuthorizationError> {
        if (!this._user) {
            return new NotAuthenticatedError();
        }

        vote.userId = this._user.id;
        var result = await this._votes.delete(vote);

        return result;
    }
}

export default authorizer<IAuthorizedVotes>(AuthorizedVotes);
