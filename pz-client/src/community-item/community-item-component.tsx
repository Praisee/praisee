import * as React from 'react';
import {Component} from 'react';
import {Link} from 'react-router';
import * as Relay from 'react-relay';
import CommentList from 'pz-client/src/comments/comment-list-component'
import Votes from 'pz-client/src/votes/votes-component';
import Avatar from 'pz-client/src/user/avatar.component';
import CommunityItemContent from 'pz-client/src/community-item/community-item-content.component';
import Tags from 'pz-client/src/community-item/tags-component';
import {CreateCommentEditor} from 'pz-client/src/comments/comment-editor-component';
import {ISignInUpContext, SignInUpContextType} from 'pz-client/src/user/sign-in-up-overlay-component';
import CommentBubble from 'pz-client/src/community-item/widgets/community-item-comment-bubble-component';
import classNames from 'classnames';
import ContentTruncator from 'pz-client/src/widgets/content-truncator-component';

interface ICommunityItemProps {
    truncateLongContent: boolean

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
    isEditingComment: boolean
}

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

        const bubbleClass = classNames('bubble', {'hidden': communityItem.commentCount === 0});

        return (
            <div className="community-item">
                <Avatar communityItem={communityItem} comment={null} />

                <div className="title">
                    <Link to={communityItem.routePath} className="title-link">{communityItem.summary}</Link>
                </div>

                {this._renderContent(communityItem)}

                <Tags topics={this.props.communityItem.topics} hideSingleTag={true} />

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
            fragment on CommunityItem {
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
