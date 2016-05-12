import * as React from 'react';
import * as $ from 'jQuery';

export class VoteBox extends React.Component<VoteBoxProps, VoteBoxState> {
  private serverRequest;

  constructor(props?: VoteBoxProps, state?: VoteBoxState) {
    super(props);
    this.state = state || new VoteBoxState();
  }

  componentDidMount() {
    this.serverRequest = $.get(
      `http://localhost:3000/api/Reviews/${this.props.reviewId}/votes?filter={"fields":{"upVote":true}}`,
      (votesResult: Vote[]) => {
        let upVotes = votesResult.filter(vote => vote.upVote).length;

        this.setState({
          upVotes: upVotes,
          downVotes: votesResult.length - upVotes,
          error: ""
        });
      });
  }

  componentWillUnmount() {
    this.serverRequest.abort();
  }

  vote(upVote) {
    let that = this;
    //record current upvotes and optimistically increase the count
    var originalUpVotes = this.state.upVotes;
    var originalDownVotes = this.state.downVotes;

    if (upVote) { this.state.upVotes++ }
    else { this.state.downVotes++ }

    this.setState({
      upVotes: this.state.upVotes,
      downVotes: this.state.downVotes,
      error: ""
    });

    this.serverRequest = $.post(
      `http://localhost:3000/api/Reviews/${this.props.reviewId}/votes`,
      {
        upVote: upVote,
        reviewerId: 1 //TODO: Get current user ID to put here
      }
    ).fail(function () {
      //TODO: Fix the 'that' hack
      that.state.upVotes = originalUpVotes;
      that.state.downVotes = originalDownVotes;
      that.setState({
        upVotes: that.state.upVotes,
        downVotes: that.state.downVotes,
        error: "failed up cast up vote soz ;("
      });
    })
  }

  render() {
    if (this.state.error) {
      var error = (<div className="bg-danger">{this.state.error}</div>);
    }

    return (
      <div>
        {error}
        <div className="col-md-6">
          <em className="col-md-6">{this.state.upVotes} found this helpful</em>
          <button type="button" className="col-md-6 btn btn-success" onClick={this.vote.bind(this, true) }>Up vote</button>
        </div>
        <div className="col-md-6">
          <em className="col-md-6">{this.state.downVotes} found this unhelpful</em>
          <button type="button" className="col-md-6 btn btn-warning" onClick={this.vote.bind(this, false) }>Down vote</button>
        </div>
      </div>
    );
  }
}

class VoteBoxProps {
  public reviewId: string
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