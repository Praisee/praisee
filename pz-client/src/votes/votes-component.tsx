import * as React from 'react';
import {Component} from 'react';
import * as Relay from 'react-relay';
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

    return this.schemaInjector.inject(
      <div>
        <em className="col-md-12">{upVotes} out of {totalVotes} people found this helpful {""+userVote}</em>
        <div className="col-md-6">
          <button type="button"
            className="col-md-6 btn btn-sm {userVote ? 'btn-success' :''}"
            onClick={this._onUpVoteClicked}>Up vote
          </button>
        </div>
        <div className="col-md-6">
          <button type="button"
            className="col-md-6 btn btn-sm {userVote ? 'btn-success' :''}"
            onClick={this._onDownVoteClicked}>Down vote
          </button>
        </div>
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