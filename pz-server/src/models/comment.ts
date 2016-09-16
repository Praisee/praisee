import {IComment, IComments} from 'pz-server/src/comments/comments';
import {IVoteInstance} from 'pz-server/src/models/vote';
import convertTextToData from 'pz-server/src/content/text-to-data-converter';
import promisify from 'pz-support/src/promisify';

export interface ICommentModel extends IPersistedModel {

}

export interface ICommentInstance extends IPersistedModelInstance {
    comments?: IRelatedPersistedModel<ICommentInstance[]>
    votes?: IRelatedPersistedModel<IVoteInstance[]>
}

module.exports = async function (Comment: ICommentModel) {
    Comment.observe('before save', async (context) => {
        const instance = context.instance || context.data;

        if(instance.rootParentId) return;
        
        if (instance.parentType == "Comment") {
            let parent = await promisify(Comment.findById, Comment)(instance.parentId);
            instance.rootParentType = parent.rootParentType;
            instance.rootParentId = parent.rootParentId;
        }
        else{
            instance.rootParentType = instance.parentType;
            instance.rootParentId = instance.parentId;
        }
    });

    Comment.observe('before save', async (context) => {
        const instance = context.instance || context.data;

        if (instance.bodyData || !instance.body) {
            return;
        }

        instance.bodyData = convertTextToData(instance.body);
    });
};
