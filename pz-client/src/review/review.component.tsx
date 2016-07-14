import {Component} from 'react';
import * as React from 'react';
import * as Relay from 'react-relay';
import {SchemaInjector, ISchemaType} from 'pz-client/src/support/schema-injector';
import ReviewBoxComponent from 'pz-client/src/review/review-box.component';
import {IReviewInstance} from 'pz-server/src/models/review';
import CommunityItemRatingComponent from 'pz-client/src/support/community-item-rating.component';

export class ReviewComponent extends Component<IReviewProps, any> {
    schemaInjector: SchemaInjector;

    constructor(props, context) {
        super(props, context);
        this.schemaInjector = new SchemaInjector(reviewSchema);
    };

    render() {
        const {review} = this.props;
        return this.schemaInjector.inject(
            <div className="review">
                {/*<ReviewBoxComponent review={this.props.review} /> */}
                <span className="name"> {this.props.review.name} </span>
                <p> {this.props.review.body} </p>
                <CommunityItemRatingComponent rating={3} voteCount={123} />
            </div>
        );
    }
}

interface IReviewProps {
    review: IReviewInstance
}

export default Relay.createContainer(ReviewComponent, {
    fragments: {
        review: () => Relay.QL`
            fragment on Review {
                id,
                summary,
                body
            }
        `
    }
});

var reviewSchema: ISchemaType = {
    "review":{
        property: "review",
        typeof: "Review"
    },
    "name": {
        property: "name"
    },
    "author": {
        property: "author"
    },
    "review-rating": {
        property: "reviewRating"
    },
    "date-published": {
        property: "datePublished"
    },
    "review-body": {
        property: "reviewBody"
    }
};