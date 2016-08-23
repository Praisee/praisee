import * as React from 'react';
import {Component} from 'react';
import * as Relay from 'react-relay';
import SchemaInjector, {ISchemaType} from 'pz-client/src/support/schema-injector';

class Votes extends React.Component<VotesProps, any> {
  schemaInjector: SchemaInjector;

  constructor(props, context) {
    super(props, context);
    this.schemaInjector = new SchemaInjector(aggregateRatingSchema);
  }

  private _vote(upVote) {
    let that = this;
    //record current upvotes and optimistically increase the count
    var originalUpVotes = this.state.upVotes;
    var originalDownVotes = this.state.downVotes;

    if (upVote) {
      this.setState({
        upVotes: this.state.upVotes
      });
      this.state.upVotes++;
    }
    else {
      this.state.downVotes++;
    }
  }

  render() {
    const {upVotes, count} = this.props.communityItem.votes;

    return this.schemaInjector.inject(
      <div>
        <em className="col-md-12">{upVotes} out of {count} people found this helpful</em>
        <div className="col-md-6">
          <button type="button" className="col-md-6 btn btn-small btn-success" onClick={this._vote.bind(this, true) }>Up vote</button>
        </div>
        <div className="col-md-6">
          <button type="button" className="col-md-6 btn btn-warning" onClick={this._vote.bind(this, false) }>Down vote</button>
        </div>
      </div>
    );
  }
}

export default Relay.createContainer(Votes, {
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

class VotesProps {
  public communityItem: any
}

class VoteBoxState {
  public upVotes: number;
  public downVotes: number;
  public error: string;

  constructor() {
    this.upVotes = 0;
    this.downVotes = 0;
    this.error = "";
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