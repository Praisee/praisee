import {IRepository, IRepositoryRecord} from 'pz-server/src/support/repository';

import {TBiCursor, ICursorResults} from 'pz-server/src/support/cursors/cursors';
import {IVote} from 'pz-server/src/votes/votes';
import {IContentData} from 'pz-server/src/content/content-data';

export interface IComment extends IRepositoryRecord {
    recordType: 'Comment'

    id?: number
    body?: string
    bodyData?: IContentData
    upVotes?: number
    downVotes?: number
    createdAt?: Date
    parentType?: string
    parentId?: number
    rootParentType?: string
    rootParentId?: number
    updatedAt?: Date
    comments?: any
    votes?: any
}

export interface IComments extends IRepository {
    findById(id: number): Promise<IComment>
    findSomeByUserId(cursor: TBiCursor, userId: number): Promise<ICursorResults<IComment>>
    create(comment: IComment, userId: number): Promise<IComment>
    findAllByParentCommentId(commentId: number): Promise<Array<IComment>>
    findCommentTreeForComment(commentId: number): Promise<IComment>
    findVotesForComment(commentId: number): Promise<Array<IVote>>
    getCountForParent(parentType: string, parentId: number): Promise<number>
    getCountForRootParent(rootParentType: string, rootParentId: number): Promise<number>
    isOwner(userId: number, commentId: number): Promise<boolean>
    update(comment: IComment): Promise<IComment>
}
