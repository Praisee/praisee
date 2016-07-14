import * as React from 'react';
import {Component} from 'react';
import ReviewBox from 'pz-client/src/review/review-box.component'

export default class ReviewList extends Component<ReviewListProps, ReviewListState> {
  private serverRequest;

  constructor(props) {
    super(props);
    this.state = { data: [] };
  }

  componentDidMount() {
    // this.serverRequest = $.get(this.props.sourceUrl, (result) => {
    //   this.setState({
    //     data: result
    //   });
    // });
  }

  componentWillUnmount() {
    this.serverRequest.abort();
  }

  render() {
    var reviews = this.state.data.map((review) => {
      return (
        <ReviewBox key={review.id} review={review} >
          {review.content}
        </ReviewBox>);
    });

    return (
      <div className="container">
        {reviews}
      </div>
    );
  }
}

class ReviewListProps {
  sourceUrl: string;
}

class ReviewListState {
  data: any;
}