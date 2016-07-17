import {Component} from 'react';
import * as React from 'react';
import * as Relay from 'react-relay';
import Review from 'pz-client/src/review/review.component';

export class ReviewListComponent extends Component<IReviewListProps, any> {
    constructor(props, context) {
        super(props, context);
    };

    render() {
        const {reviews} = this.props.viewer;
        return (
            <div className="review-list">
                { reviews.map(review =>
                    <Review key={review.id} review={review} />
                ) }
            </div>
        );
    }
}

interface IReviewListProps {
    viewer: any;
}

//https://facebook.github.io/react/blog/2015/03/19/building-the-facebook-news-feed-with-relay.html
export default Relay.createContainer(ReviewListComponent, {
    initialVariables: {
        limit: 3                                /* default to 3 reviews */
    },
    fragments: {
        viewer: () => Relay.QL`
            fragment on Viewer {
                reviewConnection(first: $limit) {
                    edges {
                        node {
                            id,
                            ${Review.getFragment('review')}
                        }
                    }
                }
            }
        `
    }
});
