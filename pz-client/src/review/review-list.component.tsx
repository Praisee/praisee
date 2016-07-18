import {Component} from 'react';
import * as React from 'react';
import * as Relay from 'react-relay';
import Review from 'pz-client/src/review/review.component';

export class ReviewListComponent extends Component<IReviewListProps, any> {
    constructor(props, context) {
        super(props, context);
    };

    render() {
        const edges = this.props.viewer.reviewConnection.edges;
        return (
            <div className="review-list">
                { edges.map(edge =>
                    <Review key={edge.node.id} review={edge.node} />
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
        limit: 3
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
