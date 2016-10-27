import {IComment, IComments} from 'pz-server/src/comments/comments';
import convertTextToData from 'pz-server/src/content/text-to-data-converter';
import promisify from 'pz-support/src/promisify';
import {IContentData} from '../content/content-data';
import {IVoteInstance, IVoteModel} from 'pz-server/src/models/vote';
import {IVotes} from 'pz-server/src/votes/votes';

export interface ICommentModel extends IPersistedModel {
    getReputationEarned(communityItemId: number, userId: number): Promise<number>
}

export interface ICommentInstance extends IPersistedModelInstance {
    body: string
    bodyData: IContentData
    createdAt: Date
    updatedAt: Date
    comments?: IRelatedPersistedModel<ICommentInstance[]>
    votes?: IRelatedPersistedModel<IVoteInstance[]>
}

module.exports = async function (Comment: ICommentModel) {
    Comment.observe('before save', async (context) => {
        const instance = context.instance || context.data;

        if (instance.rootParentId) return;

        if (instance.parentType == "Comment") {
            let parent = await promisify(Comment.findById, Comment)(instance.parentId);
            instance.rootParentType = parent.rootParentType;
            instance.rootParentId = parent.rootParentId;
        }
        else {
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

    Comment.getReputationEarned = async (commentId: number, userId: number): Promise<number> => {
        const Vote: IVoteModel = Comment.app.models.Vote;
        const votesOnUser: Array<IVoteInstance> = await promisify(Vote.find, Vote)({
            where: {
                parentId: commentId,
                parentType: "Comment",
                affectedUserId: userId
            }
        });

        let upVoteCount = votesOnUser.filter(vote => vote.isUpVote).length;

        let upVoteReputation = upVoteCount * 4;
        let downVoteReputation = (votesOnUser.length - upVoteCount) * 2;
        let reputation = upVoteReputation - downVoteReputation;

        return reputation;
    }
};
