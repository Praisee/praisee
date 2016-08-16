import {
    authorizer,
    TOptionalUser,
    NotOwnerError,
    NotAuthenticatedError,
    AuthorizationError
} from 'pz-server/src/support/authorization';
import promisify from 'pz-support/src/promisify';
import {IComment, IComments} from 'pz-server/src/comments/comments';
import isOwnerOfModel from 'pz-server/src/support/is-owner-of-model';
import {ICommunityItems, ICommunityItem} from 'pz-server/src/community-items/community-items';
import {IForwardCursor, ICursorResults} from 'pz-server/src/support/cursors';

export interface IAuthorizedComments {
    findById(id: number): Promise<IComment>
    create(comment: IComment): Promise<IComment | AuthorizationError>
    update(comment: IComment): Promise<IComment | AuthorizationError>
    findSomeComments(commentId: number): Promise<Array<IComment>>
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

    async findSomeComments(commentId: number): Promise<Array<IComment>> {
        return await this._comments.findSomeComments(commentId);
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
