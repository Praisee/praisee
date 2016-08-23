import {
    authorizer,
    TOptionalUser,
    NotOwnerError,
    NotAuthenticatedError,
    AuthorizationError
} from 'pz-server/src/support/authorization';

import {IVotes, IVote} from 'pz-server/src/votes/votes';
import {TBiCursor, ICursorResults} from 'pz-server/src/support/cursors/cursors';

export interface IAuthorizedVotes {
    findById(id: number): Promise<IVote>
    findAllByIds(ids: Array<number>): Promise<Array<IVote>>
    findSomeByUserId(cursor: TBiCursor, userId: number): Promise<ICursorResults<IVote>>
    findSomeByAffectedUserId(cursor: TBiCursor, affectedUserId: number): Promise<ICursorResults<IVote>>
    findSomeByCurrentUser(cursor: TBiCursor): Promise<ICursorResults<IVote>>
    isOwner(userId: number, voteId: number): Promise<boolean>
    create(vote: IVote): Promise<IVote | AuthorizationError>
    update(vote: IVote): Promise<IVote | AuthorizationError>
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

    async findAllByIds(ids: Array<number>): Promise<Array<IVote>>{
        return await this._votes.findAllByIds(ids);
    }

    async findSomeByUserId(cursor: TBiCursor, userId: number): Promise<ICursorResults<IVote>> {
        if (!this._user) {
            return {results: []};
        }

        return await this._votes.findSomeByUserId(cursor, this._user.id);
    }

    async findSomeByAffectedUserId(cursor: TBiCursor, affectedUserId: number): Promise<ICursorResults<IVote>> {
        if (!this._user) {
            return {results: []};
        }

        return await this._votes.findSomeByUserId(cursor, this._user.id);
    }

    async findSomeByCurrentUser(cursor: TBiCursor): Promise<ICursorResults<IVote>> {
        if (!this._user) {
            return {results: []};
        }

        return await this._votes.findSomeByUserId(cursor, this._user.id);
    }

    async isOwner(userId: number, voteId: number): Promise<boolean>{
        return await this._votes.isOwner(userId, voteId);
    }

    async create(vote): Promise<IVote | AuthorizationError> {
        if (!this._user) {
            return new NotAuthenticatedError();
        }

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
}

export default authorizer<IAuthorizedVotes>(AuthorizedVotes);
