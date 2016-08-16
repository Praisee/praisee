import {
    IRepository,
    IRepositoryRecord,
    createRecordFromLoopback
} from 'pz-server/src/support/repository';

import promisify from 'pz-support/src/promisify';

import {ITopic} from 'pz-server/src/topics/topics';
import {ISluggable} from 'pz-server/src/url-slugs/mixins/sluggable';
import isOwnerOfModel from 'pz-server/src/support/is-owner-of-model';
import {ICommentInstance, ICommentModel} from 'pz-server/src/models/comment'
import {IComment, IComments} from 'pz-server/src/comments/comments';

import {
    IForwardCursor, ICursorResults, fromDateCursor,
    shouldSkipAfter, toDateCursor
} from 'pz-server/src/support/cursors';

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

    async findSomeByUserId(cursor: IForwardCursor, userId: number): Promise<ICursorResults<IComment>> {
        let query: any = { where: { userId }, limit: cursor.take, order: 'createdAt' };

        if (shouldSkipAfter(cursor)) {
            query.where.createdAt = { gt: fromDateCursor(cursor.skipAfter) };
        }

        const commentModels = await promisify(
            this._CommentModel.find, this._CommentModel)(query);

        return this._modelsToCursorResults(commentModels);
    }

    isOwner(userId: number, commentId: number): Promise<boolean> {
        return isOwnerOfModel(userId, this._CommentModel, commentId);
    }

    async create(comment: IComment, userId: number): Promise<IComment> {
        comment = Object.assign({}, comment, userId);

        let result = await this._CommentModel.create(comment);
        return createRecordFromLoopback<IComment>('Comment', result);
    }

    async findSomeComments(commentId: number): Promise<Array<IComment>> {
        const comment: ICommentInstance = await promisify(
            this._CommentModel.findById, this._CommentModel)(commentId);

        const comments = await promisify(comment.comments, comment)();

        return comments.map((comment) =>
            createRecordFromLoopback<IComment>('Comment', comment)
        );
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

    _modelsToCursorResults(models: Array<IPersistedModelInstance>): ICursorResults<IComment> {
        const results = models.map(model => {
            const record = createRecordFromLoopback<IComment>('Comment', model);

            return {
                cursor: toDateCursor((model as any).createdAt),
                item: record
            };
        });

        return {
            results,
            hasNextPage: false //TODO:
        }
    }
}

