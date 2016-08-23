import {Component} from 'react';
import * as React from 'react';
import * as Relay from 'react-relay';
import SchemaInjector, {ISchemaType} from 'pz-client/src/support/schema-injector';

class CommunityItemRating extends Component<ICommunityItemRatingProps, any>{
    schemaInjector: SchemaInjector;

    constructor(props, context) {
        super(props, context);
        this.schemaInjector = new SchemaInjector(aggregateRatingSchema);
    }

    render() {
        const {rating, count} = this.props.votes;

        return this.schemaInjector.inject(
            <div className="aggregate-rating">
                <p>
                    <span className="rating-value">{rating}</span>/5
                    <span className="review-count">{count}</span> reviews
                </p>
            </div>
        );
    }
}

export default Relay.createContainer(CommunityItemRating, {
    fragments: {
        communityItem: () => Relay.QL`
            fragment on CommunityItem {
                votes {
                    upVotes,
                    count
                }
            }
        `
    }
});

export interface ICommunityItemRatingProps {
    itemId: number,
    votes: {
        count: Number,
        rating: Number
    }
}

var aggregateRatingSchema: ISchemaType = {
    "aggregate-rating":
    {
        property: "aggregateRating",
        typeof: "AggregateRating"
    },
    "rating-value": {
        property: "ratingValue"
    },
    "review-count": {
        property: "ratingCount"
    }
}