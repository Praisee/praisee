import {
    authorizer,
    TOptionalUser,
    NotOwnerError,
    NotAuthenticatedError,
    AuthorizationError
} from 'pz-server/src/support/authorization';

import {IComment, IComments} from 'pz-server/src/comments/comments';
import {IVote} from 'pz-server/src/votes/votes';

export interface IAuthorizedComments {
    findById(id: number): Promise<IComment>
    create(comment: IComment): Promise<IComment | AuthorizationError>
    update(comment: IComment): Promise<IComment | AuthorizationError>
    findAllByParentCommentId(commentId: number): Promise<Array<IComment>>
    findCommentTreeForComment(commentId: number): Promise<IComment>
    findVotesForComment(commentId: number): Promise<Array<IVote>>    
    getCountForParent(parentType: string, parentId: number): Promise<number>
}

class AuthorizedComments implements IAuthorizedComments {
    private _user: TOptionalUser;
    private _comments: IComments;

    constructor(user: TOptionalUser, communityItems: IComments) {
        this._user = user;
        this._comments = communityItems;
    }

    async findById(id: number): Promise<IComment> {
        return await this._comments.findById(id);
    }

    async findAllByParentCommentId(commentId: number): Promise<Array<IComment>> {
        return await this._comments.findAllByParentCommentId(commentId);
    }

    async findCommentTreeForComment(commentId: number): Promise<IComment> {
        return await this._comments.findCommentTreeForComment(commentId);
    }

     async findVotesForComment(commentId: number): Promise<Array<IVote>> {
        return await this._comments.findVotesForComment(commentId);
    }
    
    async getCountForParent(parentType: string, parentId: number): Promise<number>{
        return this._comments.getCountForParent(parentType, parentId);
    }

    async create(comment: IComment): Promise<IComment | AuthorizationError> {
        if (!this._user) {
            return new NotAuthenticatedError();
        }

        return this._comments.create(comment, this._user.id);
    }

    async update(comment): Promise<IComment | AuthorizationError> {
        if (!this._user) {
            return new NotAuthenticatedError();
        }

        const isOwner = await this._comments.isOwner(
            this._user.id, comment.id
        );

        if (!isOwner) {
            return new NotOwnerError();
        }

        return await this._comments.update(comment);
    }
}

export default authorizer<IAuthorizedComments>(AuthorizedComments);
