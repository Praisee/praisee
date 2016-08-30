import * as React from 'react';
import {Component} from 'react';
import * as Relay from 'react-relay';
import {ICommunityItem} from 'pz-server/src/community-items/community-items';
import CommentList from 'pz-client/src/widgets/comment-list-component'
import Votes from 'pz-client/src/votes/votes-component';
import CreateCommunityItemVoteMutation from 'pz-client/src/votes/create-community-item-vote-mutation'
import DeleteCommunityItemVoteMutation from 'pz-client/src/votes/delete-community-item-vote-mutation'

class CommunityItem extends Component<ICommunityItemProps, ICommuintyItemState> {
    constructor(props, context) {
        super(props, context);
    };

    render() {
        const {communityItem} = this.props;
        const {user} = communityItem;

        return (
            <div className="community-item">
                <h5>{user.displayName}</h5>
                <h4>{communityItem.summary}</h4>
                <p>{communityItem.body}</p>
                <Votes
                    key={`communityItem-votes-${communityItem.id}`}
                    upVoteClicked={this._onUpVoteClicked.bind(this) }
                    downVoteClicked={this._onDownVoteClicked.bind(this) }
                    totalVotes={communityItem.votes.count}
                    upVotes={communityItem.votes.upVotes}
                    userVote={communityItem.currentUserVote}
                    />
                <CommentList
                    key={`communityItem-commentList-${communityItem.id}`}
                    communityItem={communityItem}
                    comment={null}
                    expandTo={this.props.relay.variables.expandTo}
                    currentLevel={0}
                    />
            </div>
        )
    }

    private _deleteCurrentvote() {
        if (this.props.communityItem.currentUserVote !== null) {
            this.props.relay.commitUpdate(new DeleteCommunityItemVoteMutation({
                communityItem: this.props.communityItem
            }));
        }
    }

    private _onUpVoteClicked() {
        const {currentUserVote} = this.props.communityItem;

        if (currentUserVote !== null) {
            this._deleteCurrentvote();
        }

        this.props.relay.commitUpdate(new CreateCommunityItemVoteMutation({
            isUpVote: true,
            communityItem: this.props.communityItem
        }));
    }

    private _onDownVoteClicked() {
        const {currentUserVote} = this.props.communityItem;

        if (currentUserVote !== null) {
            this._deleteCurrentvote();
        }

        this.props.relay.commitUpdate(new CreateCommunityItemVoteMutation({
            isUpVote: false,
            communityItem: this.props.communityItem
        }));
    }
}

export default Relay.createContainer(CommunityItem, {
    initialVariables: {
        expandTo: 5
    },
    fragments: {
        communityItem: (variables) => Relay.QL`
            fragment on CommunityItem {
                summary,
                body,
                user {
                    displayName
                },
                currentUserVote
                votes {
                    upVotes,
                    total
                }
                ${CommentList.getFragment('communityItem', { expandTo: variables.expandTo })}
                ${CreateCommunityItemVoteMutation.getFragment('communityItem')}
            }
        `
    }
});

interface ICommuintyItemState {
}

interface ICommunityItemProps {
    communityItem: {
        id: number
        user: { displayName: string }
        summary: string
        body: string
        // bodyData?: IContentData
        createdAt: Date
        comments: any
        votes: any
        currentUserVote: any
    }
    body: string;
    relay: any;
}