import * as React from 'react';
import {Component} from 'react';
import * as Relay from 'react-relay';
var classnames = require('classnames');
import SchemaInjector, {ISchemaType} from 'pz-client/src/support/schema-injector';

export default class Votes extends React.Component<VotesProps, any> {
    schemaInjector: SchemaInjector;

    constructor(props, context) {
        super(props, context);
        this.schemaInjector = new SchemaInjector(aggregateRatingSchema);
    }

    private _onUpVoteClicked = () => {
        this.props.upVoteClicked();
    }

    private _onDownVoteClicked = () => {
        this.props.downVoteClicked();
    }

    render() {
        const {upVotes, totalVotes, userVote} = this.props;
        const upVoteClass = classnames('vote-btn', 'up-vote', { 'btn-success': userVote })
        const downVoteClass = classnames('vote-btn', 'down-vote', { 'btn-success': userVote === false })

        return this.schemaInjector.inject(
            <div className="aggregate-rating votes">
                {/* <em className="col-md-12">
                    <span className='rating-value'>{upVotes}</span> out of <span className='rating-count'>{totalVotes}</span> people found this helpful
                </em> */}
                <button type="button"
                    className={upVoteClass}
                    onClick={this._onUpVoteClicked}>
                    Upvote
                </button>
                <button type="button"
                    className={downVoteClass}
                    onClick={this._onDownVoteClicked}>
                    Downvote
                </button>
            </div>
        );
    }
}

interface VotesProps {
    upVoteClicked: Function
    downVoteClicked: Function
    upVotes: number
    totalVotes: number
    userVote?: boolean
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