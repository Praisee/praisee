import * as React from 'react';
import * as Relay from 'react-relay';
import {Link} from 'react-router';
import classNames from 'classnames';

class CommunityItem extends React.Component<any, any> {
    render() {
        const {communityItem} = this.props;

        let content = null;
        if (communityItem.__typename === 'ReviewCommunityItem') {
            content = this._renderReviewHeader(communityItem);
        }

        if (!content) {
            return (<span />);
        }

        return (
            <div className="community-item-type-header">
                {content}
            </div>
        )
    }

    private _renderReviewHeader(communityItem) {
        const reviewedTopic = communityItem.reviewedTopic;
        const reviewRating = communityItem.reviewRating;

        if (!reviewedTopic || !reviewRating) {
            return;
        }

        const reviewRatingClasses = classNames(
            'review-rating',
            'review-rating-' + reviewRating + '-stars'
        );

        return (
            <div className="review-community-item-header">
                <Link className="reviewed-topic" to={reviewedTopic.routePath}>
                    {reviewedTopic.name} Review
                </Link>

                <Link className={reviewRatingClasses} to={communityItem.routePath}>
                    <span className="star star-1" />
                    <span className="star star-2" />
                    <span className="star star-3" />
                    <span className="star star-4" />
                    <span className="star star-5" />
                </Link>
            </div>
        );
    }
}

export default Relay.createContainer(CommunityItem, {
    fragments: {
        communityItem: () => Relay.QL`
            fragment on CommunityItemInterface {
                __typename
                routePath
                
                ... on ReviewCommunityItem {
                    reviewedTopic {
                        name
                        routePath
                    }
                    
                    reviewRating
                }
            }
        `
    }
});
