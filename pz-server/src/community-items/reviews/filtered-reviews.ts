import {IReviews, IReview} from 'pz-server/src/community-items/reviews/reviews';

const supportedCurrencies = new Set(['usd']);

export default class FilteredReviews implements IReviews {
    private _reviews: IReviews;

    constructor(reviews: IReviews) {
        this._reviews = reviews;
    }

    updateReviewDetails(communityItemId: number, reviewDetails: IReview): Promise<IReview> {
        if (!reviewDetails) {
            throw new Error('A reviews details object must be provided')
        }

        if (!reviewDetails.reviewedTopicId) {
            throw new Error('No topic id provided');
        }

        let reviewRating = reviewDetails.reviewRating ?
            Math.min(Math.max(Math.round(reviewDetails.reviewRating*2)/2, 1), 5) : null;

        if (reviewRating && (Number.isNaN(reviewRating) || !Number.isFinite(reviewRating))) {
            reviewRating = null;
        }

        let reviewPricePaid = null;
        const reviewPricePaidNumber = Number(reviewDetails.reviewPricePaid);

        if (reviewDetails.reviewPricePaid
            && !Number.isNaN(reviewPricePaidNumber)
            && Number.isFinite(reviewPricePaidNumber)) {

            reviewPricePaid = reviewDetails.reviewPricePaid;
        }

        let reviewPricePaidCurrency = null;

        if (reviewDetails.reviewPricePaidCurrency
            && supportedCurrencies.has(reviewDetails.reviewPricePaidCurrency)) {

            reviewPricePaidCurrency = reviewDetails.reviewPricePaidCurrency;
        }

        return this._reviews.updateReviewDetails(communityItemId, {
            recordType: 'CommunityItem',
            type: 'Review',
            reviewedTopicId: reviewDetails.reviewedTopicId,
            reviewRating,
            reviewPricePaid,
            reviewPricePaidCurrency
        });
    }
}
