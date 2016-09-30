import {
    authorizer,
    TOptionalUser,
    NotOwnerError,
    NotAuthenticatedError,
    AuthorizationError
} from 'pz-server/src/support/authorization';

import {IReviews, IReview} from 'pz-server/src/community-items/reviews/reviews';
import {ICommunityItems} from 'pz-server/src/community-items/community-items';
import {getUpdateError} from '../community-items-authorizer';

export interface IAuthorizedReviews {
    updateReviewDetails(communityItemId: number, reviewDetails: IReview): Promise<IReview | AuthorizationError>
}

class AuthorizedReviews implements IAuthorizedReviews {
    private _user: TOptionalUser;
    private _reviews: IReviews;
    private _communityItems: ICommunityItems;

    constructor(user: TOptionalUser, reviews: IReviews, communityItems: ICommunityItems) {
        this._user = user;
        this._reviews = reviews;
        this._communityItems = communityItems;
    }

    async updateReviewDetails(communityItemId: number, reviewDetails: IReview): Promise<IReview | AuthorizationError> {
        const authorizationError = await getUpdateError(
            communityItemId,
            this._user,
            this._communityItems
        );

        if (authorizationError) {
            return authorizationError;
        }

        return this._reviews.updateReviewDetails(communityItemId, reviewDetails);
    }
}

export default authorizer<IAuthorizedReviews>(AuthorizedReviews);
