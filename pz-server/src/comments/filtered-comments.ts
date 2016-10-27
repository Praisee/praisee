import {IComments, IComment} from 'pz-server/src/comments/comments';
import {IDataToTextConverter} from 'pz-server/src/content/content-data';
import {ITopic} from 'pz-server/src/topics/topics';
import {TBiCursor, ICursorResults} from 'pz-server/src/support/cursors/cursors';
import {IContentFilterer} from 'pz-server/src/content/content-filterer';
import {promisedMapCursorResults} from 'pz-server/src/support/cursors/map-cursor-results';
import {IVote} from 'pz-server/src/votes/votes';

export default class FilteredComments implements IComments {
    private _Comments: IComments;
    private _contentFilterer: IContentFilterer;
    private _convertBodyDataToText: IDataToTextConverter;

    constructor(Comments: IComments, contentFilterer: IContentFilterer, convertBodyDataToText: IDataToTextConverter) {
        this._Comments = Comments;
        this._contentFilterer = contentFilterer;
        this._convertBodyDataToText = convertBodyDataToText;
    }

    async findById(id: number): Promise<IComment> {
        const comment = await this._Comments.findById(id);
        return await this._filterBeforeRead(comment);
    }

    async findSomeByUserId(cursor: TBiCursor, userId: number): Promise<ICursorResults<IComment>> {
        const filteredCursorResults = await promisedMapCursorResults(
            await this._Comments.findSomeByUserId(cursor, userId),
            async (cursorResult) => Object.assign({}, cursorResult, {
                item: await this._filterBeforeRead(cursorResult.item)
            })
        );

        return filteredCursorResults;
    }

    async isOwner(userId: number, commentId: number): Promise<boolean> {
        return await this._Comments.isOwner(userId, commentId);
    }

    async findVotesForComment(commentId: number): Promise<Array<IVote>> {
        return await this._Comments.findVotesForComment(commentId);
    }

    async findAllByParentCommentId(commentId: number): Promise<Array<IComment>> {
        return await this._Comments.findAllByParentCommentId(commentId);
    }

    async findCommentTreeForComment(commentId: number): Promise<IComment> {
        return await this._Comments.findCommentTreeForComment(commentId);
    }

    async create(comment: IComment, ownerId: number): Promise<IComment> {
        const filteredComment = await this._filterBeforeWrite(comment);
        const newComment = await this._Comments.create(filteredComment, ownerId);
        return await this._filterBeforeRead(newComment);
    }

    async update(comment: IComment): Promise<IComment> {
        const filteredComment = await this._filterBeforeWrite(comment);
        const updatedComment = await this._Comments.update(filteredComment);
        return await this._filterBeforeRead(updatedComment);
    }

    async getCountForParent(parentType: string, parentId: number): Promise<number> {
        return this._Comments.getCountForParent(parentType, parentId);
    }

    async getCountForRootParent(rootParentType: string, rootParentId: number): Promise<number> {
        return this._Comments.getCountForRootParent(rootParentType, rootParentId);
    }
    
    async getReputationEarned(commentId: number, userId: number): Promise<number> {
        return await this._Comments.getReputationEarned(commentId, userId);
    }

    async _filterBeforeRead(comment: IComment): Promise<IComment> {
        const filteredBodyData = await this._contentFilterer.filterBeforeRead(
            comment.bodyData
        );

        return Object.assign({}, comment, {
            bodyData: filteredBodyData
        });
    }

    async _filterBeforeWrite(comment: IComment): Promise<IComment> {
        const filteredBodyData = await this._contentFilterer.filterBeforeWrite(
            comment.bodyData
        );

        return Object.assign({}, comment, {
            body: this._convertBodyDataToText(filteredBodyData),
            bodyData: filteredBodyData
        });
    }
}
