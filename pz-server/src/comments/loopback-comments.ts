import {createRecordFromLoopback} from 'pz-server/src/support/repository';

import promisify from 'pz-support/src/promisify';

import isOwnerOfModel from 'pz-server/src/support/is-owner-of-model';
import {ICommentInstance, ICommentModel} from 'pz-server/src/models/comment'
import {IComment, IComments} from 'pz-server/src/comments/comments';
import {IVote} from 'pz-server/src/votes/votes';
import {IVoteInstance} from 'pz-server/src/models/vote';

import {ICursorResults, TBiCursor} from 'pz-server/src/support/cursors/cursors';
import {findWithCursor} from '../support/cursors/loopback-helpers';
import {cursorLoopbackModelsToRecords} from '../support/cursors/repository-helpers';

export function createRecordFromLoopbackComment(comment: ICommentInstance): IComment {
    return createRecordFromLoopback<IComment>('Comment', comment);
}

export function cursorCommentLoopbackModelsToRecords(comments: ICursorResults<ICommentInstance>): ICursorResults<IComment> {
    return cursorLoopbackModelsToRecords<IComment>('Comment', comments);
}

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

        return createRecordFromLoopbackComment(commentModel);
    }

    async findSomeByUserId(cursor: TBiCursor, userId: number): Promise<ICursorResults<IComment>> {
        const cursorResults = await findWithCursor<ICommentInstance>(
            this._CommentModel,
            cursor,
            { where: { userId } }
        );

        return cursorCommentLoopbackModelsToRecords(cursorResults);
    }

    isOwner(userId: number, commentId: number): Promise<boolean> {
        return isOwnerOfModel(userId, this._CommentModel, commentId);
    }

    async create(comment: IComment, userId: number): Promise<IComment> {
         let commentModel = new this._CommentModel({
            body: comment.body,
            bodyData: comment.bodyData,
            parentType: comment.parentType,
            parentId: comment.parentId,
            userId: userId
        });

        let result = await commentModel.save();
        return createRecordFromLoopbackComment(result);
    }

    async findAllByParentCommentId(commentId: number): Promise<Array<IComment>> {
        const comment: ICommentInstance = await promisify(
            this._CommentModel.findById, this._CommentModel)(commentId);

        const comments = await promisify<ICommentInstance[]>(comment.comments, comment)();

        return comments.map((comment) =>
            createRecordFromLoopbackComment(comment)
        );
    }

    async findCommentTreeForComment(commentId: number): Promise<IComment> {
        const comment: ICommentInstance = await promisify(
            this._CommentModel.findById, this._CommentModel)(commentId);

        const comments = await this._getCommentsForComment(comment);
        return comments
    }

    private async _getCommentsForComment(commentInstance: ICommentInstance): Promise<IComment> {
        let comment = createRecordFromLoopbackComment(commentInstance);
        comment.comments = [];

        const comments = await promisify<ICommentInstance[]>(commentInstance.comments, commentInstance)();

        for (var i = 0; i < comments.length; i++) {
            var currentComment = comments[i];
            comment.comments.push(await this._getCommentsForComment(currentComment));
        }

        return comment;
    }
    
    async getReputationEarned(commentId: number, userId: number): Promise<number> {
        return await this._CommentModel.getReputationEarned(commentId, userId);
    }

    async findVotesForComment(commentId: number): Promise<Array<IVote>> {
        const comment: ICommentInstance = await promisify(
            this._CommentModel.findById, this._CommentModel)(commentId);

        const votes = await promisify<IVoteInstance[]>(comment.votes, comment)();

        return votes.map((vote) =>
            createRecordFromLoopback<IVote>('Vote', vote)
        );
    }

    async getCountForRootParent(rootParentType: string, rootParentId: number): Promise<number>{
        const conditions = { rootParentType, rootParentId };
        const count = await promisify(this._CommentModel.count, this._CommentModel)(conditions);

        return count;
    }

     async getCountForParent(parentType: string, parentId: number): Promise<number>{
        const conditions = { parentType, parentId };
        const count = await promisify(this._CommentModel.count, this._CommentModel)(conditions);

        return count;
    }

    async update(comment: IComment): Promise<IComment> {
        if (!comment.id) {
            throw new Error('Cannot update record without an id');
        }

        let commentModel: ICommentInstance = await promisify(
            this._CommentModel.findById, this._CommentModel)(comment.id);

        if (!commentModel) {
            throw new Error('Could not find community item: ' + comment.id);
        }

        commentModel.body = comment.body;
        commentModel.bodyData = comment.bodyData;

        const result = await promisify(commentModel.save, commentModel)();
        return createRecordFromLoopbackComment(result);
    }
}

