import {createRecordFromLoopback} from 'pz-server/src/support/repository';

import promisify from 'pz-support/src/promisify';

import isOwnerOfModel from 'pz-server/src/support/is-owner-of-model';
import {ICommentInstance, ICommentModel} from 'pz-server/src/models/comment'
import {IComment, IComments} from 'pz-server/src/comments/comments';

import {ICursorResults, TBiCursor} from 'pz-server/src/support/cursors/cursors';
import {findWithCursor} from '../support/cursors/loopback-helpers';
import {cursorLoopbackModelsToRecords} from '../support/cursors/repository-helpers';

export default class Comments implements IComments {
    private _CommentModel: ICommentModel;

    constructor(CommentModel: ICommentModel) {
        this._CommentModel = CommentModel;
    }

    async findById(id: number): Promise<IComment> {
        const commentModel = await promisify(
            this._CommentModel.findById, this._CommentModel)(id);

        if (!commentModel) {
            return null;
        }

        return createRecordFromLoopback<IComment>('Comment', commentModel);
    }

    async findSomeByUserId(cursor: TBiCursor, userId: number): Promise<ICursorResults<IComment>> {
        const cursorResults = await findWithCursor(
            this._CommentModel,
            cursor,
            { where: { userId } }
        );

        return cursorLoopbackModelsToRecords<IComment>('Comment', cursorResults);
    }

    isOwner(userId: number, commentId: number): Promise<boolean> {
        return isOwnerOfModel(userId, this._CommentModel, commentId);
    }

    async create(comment: IComment, userId: number): Promise<IComment> {
        comment = Object.assign({}, comment, userId);

        let result = await this._CommentModel.create(comment);
        return createRecordFromLoopback<IComment>('Comment', result);
    }

    async findAllByParentCommentId(commentId: number): Promise<Array<IComment>> {
        const comment: ICommentInstance = await promisify(
            this._CommentModel.findById, this._CommentModel)(commentId);

        const comments = await promisify<ICommentInstance[]>(comment.comments, comment)();

        return comments.map((comment) =>
            createRecordFromLoopback<IComment>('Comment', comment)
        );
    }

    async getCommentTree(commentId: number): Promise<IComment> {
        const comment: ICommentInstance = await promisify(
            this._CommentModel.findById, this._CommentModel)(commentId);
            
        const comments = await this.getCommentsForComment(comment);
        return comments
    }

    async getCommentsForComment(commentInstance: ICommentInstance): Promise<IComment> {
        let comment = createRecordFromLoopback<IComment>('Comment', commentInstance);
        comment.comments = [];
        
        const comments = await promisify<ICommentInstance[]>(commentInstance.comments, commentInstance)();

        for (var i = 0; i < comments.length; i++) {
            var currentComment = comments[i];
            comment.comments.push(await this.getCommentsForComment(currentComment));
        }

        return comment;
    }

    async update(comment: IComment): Promise<IComment> {
        if (!comment.id) {
            throw new Error('Cannot update record without an id');
        }

        let commentModel = new this._CommentModel({
            id: comment.id,
            body: comment.body
        });

        const result = await promisify(commentModel.save, commentModel)();
        return createRecordFromLoopback<IComment>('Comment', result);
    }
}

