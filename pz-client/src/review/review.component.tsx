import {Component} from 'react';
import * as React from 'react';
import * as Relay from 'react-relay';
import {SchemaInjector, ISchemaType} from 'pz-client/src/support/schema-injector';
import {IReviewInstance} from 'pz-server/src/models/review';
import CommunityItemRating from 'pz-client/src/widgets/community-item-rating.component';
import { DateDisplay } from 'pz-client/src/widgets/date-display.component';

export class ReviewComponent extends Component<IReviewProps, any> {
    schemaInjector: SchemaInjector;

    constructor(props, context) {
        super(props, context);
        this.schemaInjector = new SchemaInjector(reviewSchema);
    };

    render() {
        const {dateCreated, review} = this.props;
        
        return this.schemaInjector.inject(
            <div className="review">
                <DateDisplay date={dateCreated} type="date-published" />
                <span className="name">{review.name}</span>
                <p>{review.body}</p>
                {/*<CommunityItemRating id={review.id} />*/}
            </div>
        );
    }
}

interface IReviewProps {
    review: IReviewInstance;
    dateCreated: Date;
}

export default Relay.createContainer(ReviewComponent, {
    fragments: {
        review: () => Relay.QL`
            fragment on Review {
                id,
                summary,
                body,
                dateCreated
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
    "review-body": {
        property: "reviewBody"
    }
};