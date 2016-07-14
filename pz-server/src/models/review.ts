import {ICommunityItem, ICommunityItemInstance} from 'pz-server/src/models/community-item';

export interface IReview extends ICommunityItem {
}

export interface IReviewInstance extends ICommunityItemInstance {
    id: number
    name: string
    description: string
    thumbnailPath: string
    overviewContent: string
    isVerified: boolean
}

module.exports = function (Review: IReview) {
    Review.type = 'review';
};
