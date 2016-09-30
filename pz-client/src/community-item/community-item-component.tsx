import * as React from 'react';
import { Component } from 'react';
import { Link } from 'react-router';
import * as Relay from 'react-relay';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import CommentList from 'pz-client/src/comments/comment-list-component'
import Votes from 'pz-client/src/votes/votes-component';
import Avatar from 'pz-client/src/user/avatar.component';
import CommunityItemContent from 'pz-client/src/community-item/community-item-content.component';
import Tags from 'pz-client/src/community-item/tags-component';
import { CreateCommentEditor } from 'pz-client/src/comments/comment-editor-component';
import { ISignInUpContext, SignInUpContextType } from 'pz-client/src/user/sign-in-up-overlay-component';
import CommentBubble from 'pz-client/src/community-item/widgets/community-item-comment-bubble-component';
import classNames from 'classnames';
import ContentTruncator from 'pz-client/src/widgets/content-truncator-component';
import handleClick from 'pz-client/src/support/handle-click';

interface ICommunityItemProps {
    isMinimized: boolean;
    truncateLongContent: boolean;

    communityItem: {
        id: number
        user: { displayName: string }
        summary: string
        body: string
        createdAt: Date
        commentCount: number
        comments: any
        topics: Array<{ id: string, name: string, routePath: string }>
        routePath: string
    }

    body: string;
    relay: any;
    createCommunityItemVoteMutation: any;
}

interface ICommuintyItemState {
    isEditingComment?: boolean;
    isMinimized?: boolean;
}

class CommunityItem extends Component<ICommunityItemProps, ICommuintyItemState> {
    static contextTypes: any = {
        appViewerId: React.PropTypes.string.isRequired,
        signInUpContext: SignInUpContextType
    };

    context: {
        appViewerId: number,
        signInUpContext: ISignInUpContext
    };

    constructor(props, context) {
        super(props, context);
        this.state = {
            isEditingComment: false,
            isMinimized: this.props.isMinimized
        };
    };

    render() {
        const communityItemClass = classNames('community-item', { 'minimized': this.state.isMinimized });

        return (
            <div className={communityItemClass}>
                {this._renderHeader()}

                <ReactCSSTransitionGroup
                    transitionName="slide"
                    transitionEnterTimeout={300}
                    transitionLeaveTimeout={300}>

                    {!this.state.isMinimized && this._renderMaximizedLayout()}

                </ReactCSSTransitionGroup>
            </div>
        )
    }

    private _renderHeader() {
        const {communityItem} = this.props;

        return (
            <div key="header" className="community-item-header">
                <div className="title">
                    {this._renderTitle()}
                </div>
                <div className="minimize-button-container">
                    <button className="minimize-button"
                        title="Mark as read"
                        onClick={handleClick(this._toggleMinimized.bind(this))}>
                    </button>
                </div>
            </div>
        )
    }

    private _renderTitle() {
        const {communityItem} = this.props;

        if (this.state.isMinimized) {
            return (
                <a href={communityItem.routePath}
                    className="title-link minimized"
                    onClick={this._toggleMinimized.bind(this)}>
                    {communityItem.summary}
                </a>
            )
        } else {
            return (
                <Link className="title-link maximized"
                    to={communityItem.routePath}>
                    {communityItem.summary}
                </Link>
            )
        }
    }

    private _renderMaximizedLayout() {
        const {communityItem} = this.props;
        const {user} = communityItem;
        const bubbleClass = classNames('bubble', { 'hidden': communityItem.commentCount === 0 });

        return (
            <div className="community-item-maximized">
                <div className="community-item-maximized-inner">
                    <Avatar communityItem={communityItem} comment={null}
                        showReputation={true}
                        showTrusts={true}
                        showTrustButton={true} />

                    {this._renderContent(communityItem)}

                    <Tags topics={this.props.communityItem.topics} shouldRenderSingleTag={false} />

                    {this._renderVotesAndReply()}

                    {this._renderCommentList()}
                </div>
            </div>
        )
    }

    private _renderContent(communityItem) {
        if (this.props.truncateLongContent) {
            return (
                <ContentTruncator truncateToHeight={175} heightMargin={50}>
                    <CommunityItemContent communityItem={communityItem} />
                </ContentTruncator>
            );

        } else {

            return (
                <CommunityItemContent communityItem={communityItem} />
            );
        }
    }

    private _renderVotesAndReply() {
        const {communityItem} = this.props;

        return (
            <div className="community-item-bottom">
                {!this.state.isEditingComment && (
                    <div className="left">
                        <Votes
                            key={`communityItem-votes-${communityItem.id}`}
                            comment={null}
                            communityItem={this.props.communityItem} />
                        <CommentBubble onClick={this._toggleComments.bind(this)} communityItem={this.props.communityItem} />
                    </div>
                )}
                <CreateCommentEditor
                    comment={null}
                    communityItem={communityItem}
                    onEditing={this._onEditingComment.bind(this)} />
            </div>
        );
    }

    private _renderCommentList() {
        const {communityItem} = this.props;

        if (this.props.relay.variables.expandComments)
            return (
                <CommentList
                    key={`communityItem-commentList-${communityItem.id}`}
                    communityItem={communityItem}
                    comment={null}
                    expandCommentsTo={this.props.relay.variables.expandCommentsTo}
                    currentLevel={0} />
            )
    }

    private _toggleMinimized(e) {
        e.preventDefault();
        this.setState({ isMinimized: !this.state.isMinimized });
    }

    private _toggleComments() {
        this.props.relay.setVariables({
            expandComments: !this.props.relay.variables.expandComments
        })
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
            fragment on CommunityItemInterface {
                summary
                body
                user {
                    displayName
                }
                topics {
                    id
                    name
                    routePath
                }
                routePath
                ${CommentList.getFragment('communityItem', { expandCommentsTo }).if(expandComments)}
                ${Avatar.getFragment('communityItem')}
                ${CommunityItemContent.getFragment('communityItem')}
                ${CreateCommentEditor.getFragment('communityItem')}
                ${Votes.getFragment('communityItem')}
                ${CommentBubble.getFragment('communityItem')}
            }
        `
    }
});
