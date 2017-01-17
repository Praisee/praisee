import {ISluggable} from 'pz-server/src/url-slugs/mixins/sluggable';
import { ICommunityItemModel } from 'pz-server/src/models/community-item';
import { IVoteModel, IVoteInstance } from 'pz-server/src/models/vote';
import promisify from 'pz-support/src/promisify';

export interface IUserModel extends IPersistedModel, ISluggable {
    getTotalCommunityItems(userId: number): Promise<number>
    getTotalTrusters(userId: number): Promise<number>
    getReputation(userId: number): Promise<number>
    isUserTrusting(trusterId: number, trustedId: number): Promise<boolean>
}

export interface IUserInstance extends IPersistedModelInstance {
    id: number
    displayName: string
    email: string
    isAdmin: boolean
    created: Date
    trusters?: IRelatedPersistedModel<IUserInstance[]>
    trusting?: IRelatedPersistedModel<IUserInstance[]>
}

module.exports = function (User: IUserModel) {
    User.getTotalCommunityItems = async (userId: number) => {
        const CommunityItem: ICommunityItemModel = User.app.models.CommunityItem;
        const getCount = promisify(CommunityItem.count, CommunityItem);

        return await getCount({
            userId: userId
        });
    };

    User.getTotalTrusters = async (userId: number) => {
        const Trust = User.app.models.Trust;
        const getCount = promisify(Trust.count, Trust);

        return await getCount({
            trustedId: userId
        });
    };

    User.isUserTrusting = async (trusterId: number, trustedId: number) => {
        const Trust = User.app.models.Trust;
        const find = promisify(Trust.find, Trust);

        let result: any = await find({
            where: {
                trustedId,
                trusterId
            }
        });

        return result.length > 0;
    };

    User.getReputation = async (userId: number) => {
        const Vote: IVoteModel = User.app.models.Vote;
        const votesOnUser: Array<IVoteInstance> = await promisify(Vote.find, Vote)({
            where: {
                affectedUserId: userId
            }
        });

        let communityItemVotes = votesOnUser.filter(vote => vote.parentType === "CommunityItem");
        let communityItemUpVoteCount = communityItemVotes.filter(vote => vote.isUpVote).length;
        let communityItemUpVoteReputation = communityItemUpVoteCount * 10;
        let communityItemDownVoteReputation = (communityItemVotes.length - communityItemUpVoteCount) * 5;
        let communityItemReputation = communityItemUpVoteReputation - communityItemDownVoteReputation;

        let commentVotes = votesOnUser.filter(vote => vote.parentType === "Comment");
        let commentUpVoteCount = commentVotes.filter(vote => vote.isUpVote).length;
        let commentUpVoteReputation = commentUpVoteCount * 4;
        let commentDownVoteReputation = (commentVotes.length - commentUpVoteCount) * 2;
        let commentReputation = commentUpVoteReputation - commentDownVoteReputation;

        return communityItemUpVoteReputation + commentReputation;
    }
};
