import * as React from 'react';
import {Component} from 'react';
import {Link} from 'react-router';
import * as Relay from 'react-relay';
import {ICommunityItem} from 'pz-server/src/community-items/community-items';
import CommentList from 'pz-client/src/comments/comment-list-component'
import Votes from 'pz-client/src/votes/votes-component';
import Avatar from 'pz-client/src/user/avatar.component';
import CommunityItemContent from 'pz-client/src/community-item/community-item-content.component';
import Tags from 'pz-client/src/community-item/tags-component';
import CreateCommunityItemVoteMutation from 'pz-client/src/votes/create-community-item-vote-mutation';
import UpdateCommunityItemVoteMutation from 'pz-client/src/votes/update-community-item-vote-mutation';
import DeleteCommunityItemVoteMutation from 'pz-client/src/votes/delete-community-item-vote-mutation';
import CreateCommentForCommunityItemMutation from 'pz-client/src/comments/create-comment-for-community-item-mutation';
import Error from 'pz-client/src/widgets/error-component';
import {IContentData} from 'pz-server/src/content/content-data';
import {CreateCommentEditor} from 'pz-client/src/comments/comment-editor-component';
import {ISignInUpContext, SignInUpContextType} from 'pz-client/src/user/sign-in-up-overlay-component';
import classNames from 'classnames';

class CommunityItem extends Component<ICommunityItemProps, ICommuintyItemState> {
    static contextTypes : any = {
        appViewerId: React.PropTypes.string.isRequired,
        signInUpContext: SignInUpContextType
    };

    context: {
        appViewerId: number,
        signInUpContext: ISignInUpContext
    };

    constructor(props, context) {
        super(props, context);
        this.state = { isEditingComment: false };
    };

    render() {
        const {communityItem} = this.props;
        const {user} = communityItem;

        //TODO: Look into how to get the error from payloads
        const error = this.props.createCommunityItemVoteMutation ?
            <Error message={this.props.createCommunityItemVoteMutation.error} /> :
            null;

        const bubbleClass = classNames('bubble', {'hidden': communityItem.commentCount === 0});

        //TODO: Figure out how to truncate longer content
        const communityItemClasses = classNames({'long-content': false})

        return (
            <div className="community-item">
                <Avatar communityItem={communityItem} comment={null} />
                <Link to={communityItem.routePath} className="title">{communityItem.summary}</Link>
                <CommunityItemContent className={communityItemClasses} communityItem={communityItem} />
                {error}
                <Tags topics={this.props.communityItem.topics} />
                <div className="community-item-bottom">
                    {!this.state.isEditingComment && (
                        <div className="left">
                            <Votes
                                key={`communityItem-votes-${communityItem.id}`}
                                upVoteClicked={this._onUpVoteClicked.bind(this) }
                                downVoteClicked={this._onDownVoteClicked.bind(this) }
                                totalVotes={communityItem.votes.total}
                                upVotes={communityItem.votes.upVotes}
                                userVote={communityItem.currentUserVote}
                                />
                            <span className={bubbleClass} onClick={this._toggleComments.bind(this)}>{communityItem.commentCount}</span>
                        </div>
                    )}
                    <CreateCommentEditor
                        comment={null}
                        communityItem={communityItem}
                        onSave={this._onCommentSave.bind(this) }
                        onEditing={this._onEditingComment.bind(this) } />
                </div>
                {this.props.relay.variables.expandComments && <CommentList
                    key={`communityItem-commentList-${communityItem.id}`}
                    communityItem={communityItem}
                    comment={null}
                    expandCommentsTo={this.props.relay.variables.expandCommentsTo}
                    currentLevel={0}
                    />}
            </div>
        )
    }

    private _toggleComments() {
        this.props.relay.setVariables({
            expandComments: !this.props.relay.variables.expandComments
        })
    }

    private _onCommentSave(bodyData) {
        this.props.relay.commitUpdate(new CreateCommentForCommunityItemMutation({
            bodyData: bodyData,
            communityItem: this.props.communityItem,
            appViewerId: this.context.appViewerId
        }));
    }

    private _createVote(isUpVote: boolean) {
        this.props.relay.commitUpdate(new CreateCommunityItemVoteMutation({
            isUpVote: isUpVote,
            communityItem: this.props.communityItem,
            appViewerId: this.context.appViewerId
        }));
    }

    private _deleteCurrentVote() {
        this.props.relay.commitUpdate(new DeleteCommunityItemVoteMutation({
            communityItem: this.props.communityItem,
            appViewerId: this.context.appViewerId
        }));
    }

    private _updateCurrentVote(isUpVote: boolean) {
        this.props.relay.commitUpdate(new UpdateCommunityItemVoteMutation({
            communityItem: this.props.communityItem,
            isUpVote: isUpVote,
            appViewerId: this.context.appViewerId
        }));
    }

    private _doVoteLogic(isUpVote: boolean) {
        if (!this.context.signInUpContext.isLoggedIn) {
            this.context.signInUpContext.showSignInUp(event);
            return;
        }

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

    private _onEditingComment(isEditingComment) {
        this.setState({ isEditingComment });
    }
}

export default Relay.createContainer(CommunityItem, {
    initialVariables: {
        expandCommentsTo: 5,
        expandComments: false
    },
    fragments: {
        communityItem: ({expandCommentsTo, expandComments}) => Relay.QL`
            fragment on CommunityItem {
                summary
                body
                user {
                    displayName
                }
                votes{
                    upVotes
                    total
                }
                currentUserVote
                topics {
                    id
                    name
                    routePath
                }
                commentCount
                routePath
                ${CommentList.getFragment('communityItem', { expandCommentsTo }).if(expandComments)}
                ${Avatar.getFragment('communityItem')}
                ${CommunityItemContent.getFragment('communityItem')}
                ${CreateCommentEditor.getFragment('communityItem')}
                ${CreateCommunityItemVoteMutation.getFragment('communityItem')}
                ${DeleteCommunityItemVoteMutation.getFragment('communityItem')}
                ${UpdateCommunityItemVoteMutation.getFragment('communityItem')}
                ${CreateCommentForCommunityItemMutation.getFragment('communityItem')}
            }
        `
    }
});

interface ICommuintyItemState {
    isEditingComment: boolean
}

interface ICommunityItemProps {
    communityItem: {
        id: number
        user: { displayName: string }
        summary: string
        body: string
        bodyData?: IContentData
        createdAt: Date
        commentCount: number
        comments: any
        votes: any
        currentUserVote: any
        topics: Array<{ id: string, name: string, routePath: string }>
        routePath: string
    }
    body: string;
    relay: any;
    createCommunityItemVoteMutation: any;
}
