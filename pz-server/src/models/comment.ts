import {IComment, IComments} from 'pz-server/src/comments/comments';

export interface ICommentModel extends IPersistedModel {

}

export interface ICommentInstance extends IPersistedModelInstance {
    comments?: IRelatedPersistedModel<ICommentInstance[]>
}

module.exports = function (Comment: IComment) {
};
