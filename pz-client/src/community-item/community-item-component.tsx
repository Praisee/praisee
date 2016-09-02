import * as React from 'react';
import {Component} from 'react';
import * as Relay from 'react-relay';
import {ICommunityItem} from 'pz-server/src/community-items/community-items';
import CommentList from 'pz-client/src/comments/comment-list-component'
import Votes from 'pz-client/src/votes/votes-component';
import Avatar from 'pz-client/src/user/avatar.component';
import CommunityItemContent from 'pz-client/src/editor/community-item-content.component';
import Tags from 'pz-client/src/community-item/tags-component';
import CreateCommunityItemVoteMutation from 'pz-client/src/votes/create-community-item-vote-mutation';
import UpdateCommunityItemVoteMutation from 'pz-client/src/votes/update-community-item-vote-mutation';
import DeleteCommunityItemVoteMutation from 'pz-client/src/votes/delete-community-item-vote-mutation';
import Error from 'pz-client/src/widgets/error-component';
import {IContentData} from 'pz-server/src/content/content-data';

class CommunityItem extends Component<ICommunityItemProps, ICommuintyItemState> {
    constructor(props, context) {
        super(props, context);
    };

    render() {
        const {communityItem} = this.props;
        const {user} = communityItem;

        //TODO: Look into how to get the error from payloads
        const error = this.props.createCommunityItemVoteMutation ?
            <Error message={this.props.createCommunityItemVoteMutation.error} /> :
            null;

        return (
            <div className="community-item">
                <Avatar communityItem={communityItem} comment={null} />
                <h4>{communityItem.summary}</h4>
                <CommunityItemContent communityItem={communityItem} />
                {error}
                <Votes
                    key={`communityItem-votes-${communityItem.id}`}
                    upVoteClicked={this._onUpVoteClicked.bind(this) }
                    downVoteClicked={this._onDownVoteClicked.bind(this) }
                    totalVotes={communityItem.votes.total}
                    upVotes={communityItem.votes.upVotes}
                    userVote={communityItem.currentUserVote}
                    />
                <Tags topics={this.props.communityItem.topics} />
                <CommentList
                    key={`communityItem-commentList-${communityItem.id}`}
                    communityItem={communityItem}
                    comment={null}
                    expandCommentsTo={this.props.relay.variables.expandCommentsTo}
                    currentLevel={0}
                    />
            </div>
        )
    }

    private _createVote(isUpVote: boolean) {
        this.props.relay.commitUpdate(new CreateCommunityItemVoteMutation({
            isUpVote: isUpVote,
            communityItem: this.props.communityItem
        }));
    }

    private _deleteCurrentVote() {
        this.props.relay.commitUpdate(new DeleteCommunityItemVoteMutation({
            communityItem: this.props.communityItem
        }));
    }

    private _updateCurrentVote(isUpVote: boolean) {
        this.props.relay.commitUpdate(new UpdateCommunityItemVoteMutation({
            communityItem: this.props.communityItem,
            isUpVote: isUpVote
        }));
    }

    private _doVoteLogic(isUpVote: boolean) {
        const {currentUserVote} = this.props.communityItem;

        if (currentUserVote !== null) {
            if (currentUserVote === isUpVote)
                this._deleteCurrentVote();
            if (currentUserVote !== isUpVote)
                this._updateCurrentVote(isUpVote);
        }
        else {
            this._createVote(isUpVote);
        }
    }

    private _onUpVoteClicked() {
        this._doVoteLogic(true);
    }

    private _onDownVoteClicked() {
        this._doVoteLogic(false);
    }
}

export default Relay.createContainer(CommunityItem, {
    initialVariables: {
        expandCommentsTo: 5
    },
    fragments: {
        communityItem: ({expandCommentsTo}) => Relay.QL`
            fragment on CommunityItem {
                summary,
                body,
                user {
                    displayName
                },
                votes{
                    upVotes,
                    total
                },
                currentUserVote,
                topics {
                    id,
                    name,
                    routePath
                }
                ${CommentList.getFragment('communityItem', { expandCommentsTo })}
                ${Avatar.getFragment('communityItem')}
                ${CommunityItemContent.getFragment('communityItem')}
                ${CreateCommunityItemVoteMutation.getFragment('communityItem')}
                ${DeleteCommunityItemVoteMutation.getFragment('communityItem')}
                ${UpdateCommunityItemVoteMutation.getFragment('communityItem')}
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
        bodyData?: IContentData
        createdAt: Date
        comments: any
        votes: any
        currentUserVote: any
        topics: Array<{ id: string, name: string, routePath: string }>
    }
    body: string;
    relay: any;
    createCommunityItemVoteMutation: any;
}