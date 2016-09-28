import {Component} from 'react';
import * as React from 'react';
import * as Relay from 'react-relay';
import SchemaInjector, {ISchemaType} from 'pz-client/src/support/schema-injector';
// import CommunityItemRating from 'pz-client/src/widgets/community-item-rating.component';
import { DateDisplay } from 'pz-client/src/widgets/date-display.component';
import {ICommunityItemInstance} from 'pz-server/src/models/community-item';

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
                <h2 className="name">{review.summary}</h2>
                <DateDisplay date={review.createdAt} type="date-published" />
                <p className="review-body">{review.body}</p>
            </div>
        );
    }
}

interface IReviewProps {
    review: ICommunityItemInstance;
    createdAt: string;
}

export default Relay.createContainer(ReviewComponent, {
    fragments: {
        // review: () => Relay.QL`
        //     fragment on Review {
        //         id,
        //         summary,
        //         body,
        //         createdAt
        //     }
        // `
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
    "review-body": {
        property: "reviewBody"
    }
};
