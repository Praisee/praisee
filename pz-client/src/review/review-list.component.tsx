import {Component} from 'react';
import * as React from 'react';
import * as Relay from 'react-relay';
import Review from 'pz-client/src/review/review.component';

export class ReviewListComponent extends Component<IReviewListProps, any> {
    constructor(props, context) {
        super(props, context);
    };

    render() {
        const {reviews} = this.props;
        return (
            <div className="review-list">
                {reviews.map(reviewId => <Review itemId={reviewId} />) }
            </div>
        );
    }
}

interface IReviewListProps {
    reviews: Number[]
}

//https://facebook.github.io/react/blog/2015/03/19/building-the-facebook-news-feed-with-relay.html
export default Relay.createContainer(ReviewListComponent, {
    initialVariables: {
        count: 3                                /* default to 3 reviews */
    },
    fragments: {
        viewer: () => Relay.QL`
      fragment on Viewer {
        reviews(first: $count) {
          edges {
            node {
              ${Review.getFragment('review')}
            }
          }
        }
      }
    `,
    }
});