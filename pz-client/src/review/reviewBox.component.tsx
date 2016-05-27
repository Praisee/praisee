import * as React from 'react';
import {ReviewerAvatar} from 'pz-client/src/review/reviewerAvatar.component'
import {VoteBox} from 'pz-client/src/review/voteBox.component'

export default class ReviewBox extends React.Component<ReviewBoxProps, ReviewBoxState> {

  render() {
    return (
      <div className="col-md-6" style={{ marginBottom: "100px" }}>
        <div className="col-md-9">
          <h3>{this.props.review.rating}/5</h3>
          <em>{this.props.review.date}</em>
          <p>{this.props.children}</p>
        </div>
        <div className="col-md-3">
          <ReviewerAvatar id={this.props.review.reviewerId} />
        </div>
        <VoteBox reviewId={this.props.review.id} />
      </div>
    );
  }
}

class ReviewBoxProps {
  review: Review
}

class ReviewBoxState {

} 

// App Controller
  // Review Controller -> Reviews[]
    // ReviewList Component -> Review
      // Review Component  -> Review.content,  -> Review.Avatar,  -> Review.Vote
        // Review content
        // Avatar Component
        // Vote Component
    