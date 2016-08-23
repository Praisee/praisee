import {IComment, IComments} from 'pz-server/src/comments/comments';
import {IVoteInstance} from 'pz-server/src/models/vote';

export interface ICommentModel extends IPersistedModel {

}

export interface ICommentInstance extends IPersistedModelInstance {
    comments?: IRelatedPersistedModel<ICommentInstance[]>
    votes?: IRelatedPersistedModel<IVoteInstance[]>
}

module.exports = function (Comment: IComment) {
};
