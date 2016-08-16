import {
    IRepository,
    IRepositoryRecord,
    createRecordFromLoopback
} from 'pz-server/src/support/repository';

import promisify from 'pz-support/src/promisify';

import {ITopic} from 'pz-server/src/topics/topics';
import {ISluggable} from 'pz-server/src/url-slugs/mixins/sluggable';
import isOwnerOfModel from 'pz-server/src/support/is-owner-of-model';
import {ICommentInstance} from 'pz-server/src/models/comment'

import {
    IForwardCursor, ICursorResults, fromDateCursor,
    shouldSkipAfter, toDateCursor
} from 'pz-server/src/support/cursors';

export interface IComment extends IRepositoryRecord {
    recordType: 'Comment'

    id?: number
    body: string
    upVotes: number
    downVotes: number
    createdAt?: Date
    updatedAt?: Date
    comments?: any
}

export interface IComments extends IRepository {
    findById(id: number): Promise<IComment>
    findSomeByUserId(cursor: IForwardCursor, userId: number): Promise<ICursorResults<IComment>>
    create(comment: IComment, userId: number): Promise<IComment>
    findSomeComments(commentId: number): Promise<Array<IComment>>
    isOwner(userId: number, commentId: number): Promise<boolean>
    update(comment: IComment): Promise<IComment>
}
