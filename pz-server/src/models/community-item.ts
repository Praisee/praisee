import {ISluggable, ISluggableInstance} from 'pz-server/src/url-slugs/mixins/sluggable';
import {ITopicInstance} from 'pz-server/src/models/topic';
import {ICommentInstance} from 'pz-server/src/models/comment';
import {IContentData} from 'pz-server/src/content/content-data';
import convertTextToData from 'pz-server/src/content/text-to-data-converter';
import {IVoteInstance, IVoteModel} from 'pz-server/src/models/vote';
import {IVotes} from 'pz-server/src/votes/votes';
import {IPhotoInstance} from 'pz-server/src/models/photo';
import promisify from 'pz-support/src/promisify';

export type TCommunityItemType = (
    'General'
    | 'Comment'
    | 'Comparison'
    | 'Guide'
    | 'Question'
    | 'Review'
);

export type TLegacyCommunityItemType = (
    'general'
    | 'comment'
    | 'comparison'
    | 'guide'
    | 'question'
    | 'review'
);

export interface ICommunityItemModel extends IPersistedModel, ISluggable {
    type: TLegacyCommunityItemType
    getReputationEarned(communityItemId: number, userId: number): Promise<number>
}

export interface ICommunityItemInstance extends IPersistedModelInstance, ISluggableInstance {
    id: number
    userId: number
    type: TCommunityItemType
    summary: string
    body: string
    bodyData: IContentData
    createdAt: Date
    updatedAt: Date
    topics: IRelatedPersistedModel<ITopicInstance[]>
    comments?: IRelatedPersistedModel<ICommentInstance[]>
    votes?: IRelatedPersistedModel<IVoteInstance[]>
    photos?: IRelatedPersistedModel<IPhotoInstance>

    // Review-specific
    reviewedTopic?: IRelatedPersistedModel<ITopicInstance>
    reviewedTopicId?: number,
    reviewRating?: number,
    reviewPricePaid?: string,
    reviewPricePaidCurrency?: 'usd'
}

module.exports = function (CommunityItem: ICommunityItemModel) {
    // TODO: This is a temporary fix to add body content data from plain content
    // TODO: everything uses repositories
    CommunityItem.observe('before save', async (context) => {
        const instance = context.instance || context.data;

        if (instance.bodyData || !instance.body) {
            return;
        }

        instance.bodyData = convertTextToData(instance.body);
    });

    CommunityItem.getReputationEarned = async (communityItemId: number, userId: number): Promise<number> => {
        const Vote: IVoteModel = CommunityItem.app.models.Vote;
        const votesOnUser: Array<IVoteInstance> = await promisify(Vote.find, Vote)({
            where: {
                parentId: communityItemId,
                parentType: "CommunityItem",
                affectedUserId: userId
            }
        });

        let upVoteCount = votesOnUser.filter(vote => vote.isUpVote).length;

        let upVoteReputation = upVoteCount * 10;
        let downVoteReputation = (votesOnUser.length - upVoteCount) * 5;
        let reputation = upVoteReputation - downVoteReputation;

        return reputation;
    }
};
