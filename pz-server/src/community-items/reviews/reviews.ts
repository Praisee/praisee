import {IRepository} from 'pz-server/src/support/repository';

import {ICommunityItem} from 'pz-server/src/community-items/community-items';

export interface IReview extends ICommunityItem {
    type?: 'Review'
    reviewedTopicId?: number
    reviewRating?: number
    reviewPricePaid?: string
    reviewPricePaidCurrency?: 'usd'
}

export interface IReviews extends IRepository {
    updateReviewDetails(communityItemId: number, reviewDetails: IReview): Promise<IReview>
}

