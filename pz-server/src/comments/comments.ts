import {IRepository, IRepositoryRecord} from 'pz-server/src/support/repository';

import {TBiCursor, ICursorResults} from 'pz-server/src/support/cursors/cursors';

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
    findSomeByUserId(cursor: TBiCursor, userId: number): Promise<ICursorResults<IComment>>
    create(comment: IComment, userId: number): Promise<IComment>
    findAllByParentCommentId(commentId: number): Promise<Array<IComment>>
    isOwner(userId: number, commentId: number): Promise<boolean>
    update(comment: IComment): Promise<IComment>
}
