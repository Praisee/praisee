import * as React from 'react';

export class ReviewerAvatar extends React.Component<ReviewerAvatarProps, ReviewerAvatarState> {
    private serverRequest;

    constructor(props) {
        super(props);
        this.state = { email: "", reputation: 0 };
    }

    componentDidMount() {
        // this.serverRequest = $.get(`http://localhost:3000/api/Reviewers/${this.props.id}`,
        //     (reviewer: Reviewer) => {
        //         this.setState({
        //             email: reviewer.email,
        //             reputation: 0
        //         });
        //     }).done((data) => {
        //         $.get(`http://localhost:3000/api/Reviewers/${this.props.id}/reputation`,
        //             (response) => {
        //                 this.setState({
        //                     email: this.state.email,
        //                     reputation: response.reputation
        //                 });
        //             })
        //     });;
    }

    componentWillUnmount() {
        this.serverRequest.abort();
    }

    render() {
        return (
            <div>
                <img src="http://avatarbox.net/avatars/img19/close_up_spongebob_avatar_picture_25859.gif" className="img-circle" /> <br />
                <p>{this.state.email}</p>
                <p classnName={this.state.reputation > 0 ? "text-success" : "text-danger"} >{this.state.reputation}</p>
            </div>
        );
    }
}


export class ReviewerAvatarProps {
    id: string
}

export class ReviewerAvatarState {
    email: string;
    reputation: Number;
} 