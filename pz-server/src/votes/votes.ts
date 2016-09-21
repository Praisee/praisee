import { IRepository, IRepositoryRecord } from 'pz-server/src/support/repository';

import {
    ICursorResults, TBiCursor
} from 'pz-server/src/support/cursors/cursors';

export interface IVote extends IRepositoryRecord {
    recordType: 'Vote'

    id?: number
    userId?: number
    isUpVote?: boolean
    parentType?: string
    parentId?: number
    createdAt?: Date
    updatedAt?: Date
}

export interface IVotes extends IRepository {
    findById(id: number): Promise<IVote>
    findAllByIds(ids: Array<number>): Promise<Array<IVote>>
    findSomeByUserId(cursor: TBiCursor, userId: number): Promise<ICursorResults<IVote>>
    findSomeByAffectedUserId(cursor: TBiCursor, affectedUserId: number): Promise<ICursorResults<IVote>>
    findOneByFilter(vote: IVote) : Promise<IVote>
    findAllByFilter(vote: IVote): Promise<Array<IVote>>
    getAggregateForParent(parentType: string, parentId: number): Promise<IVoteAggregate>
    getAggregateForAffectedUser(userId: number): Promise<IVoteAggregate>
    isOwner(userId: number, voteId: number): Promise<boolean>
    create(vote: IVote, ownerId: number): Promise<IVote>
    update(vote: IVote): Promise<IVote>
    destroy(vote: IVote): Promise<boolean>
}

export interface IVotesBatchable {
    findAllByIds(ids: Array<number>): Promise<Array<IVote>>
    getAllAggregatesForParents(parents: Array<[string, number]>): Promise<Array<IVoteAggregate>>
    getAllAggregatesForAffectedUsers(userIds: Array<number>): Promise<Array<IVoteAggregate>>
}

export interface IVoteAggregate {
    upVotes: number,
    downVotes: number,
    total: number
}
