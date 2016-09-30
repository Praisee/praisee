import promisify from 'pz-support/src/promisify';

import {IReviews, IReview} from 'pz-server/src/community-items/reviews/reviews';

import {
    ICommunityItemModel,
    ICommunityItemInstance
} from 'pz-server/src/models/community-item';

import {ITopics} from 'pz-server/src/topics/topics';

import {createRecordFromLoopback} from 'pz-server/src/support/repository';

export function createReviewRecordFromLoopbackCommunityItem(communityItem: ICommunityItemInstance): IReview {
    return createRecordFromLoopback<IReview>('CommunityItem', communityItem);
}

export default class LoopbackReviews implements IReviews {
    private _CommunityItemModel: ICommunityItemModel;
    private _topics: ITopics;

    constructor(CommunityItem: ICommunityItemModel, topics: ITopics) {
        this._CommunityItemModel = CommunityItem;
        this._topics = topics;
    }

    async updateReviewDetails(communityItemId: number, reviewDetails: IReview): Promise<IReview> {
        const topic = this._topics.findById(reviewDetails.reviewedTopicId);

        if (!topic) {
            throw new Error('Unknown topic: ' + reviewDetails.reviewedTopicId);
        }

        let communityItemModel: ICommunityItemInstance = await promisify(
            this._CommunityItemModel.findById, this._CommunityItemModel)(communityItemId);

        if (!communityItemModel) {
            throw new Error('Could not find community item: ' + communityItemId);
        }

        communityItemModel.type = 'Review';
        communityItemModel.reviewedTopicId = reviewDetails.reviewedTopicId;
        communityItemModel.reviewRating = reviewDetails.reviewRating;
        communityItemModel.reviewPricePaid = reviewDetails.reviewPricePaid;
        communityItemModel.reviewPricePaidCurrency = reviewDetails.reviewPricePaidCurrency;

        const result = await promisify(communityItemModel.save, communityItemModel)();
        return createReviewRecordFromLoopbackCommunityItem(result);
    }
}
