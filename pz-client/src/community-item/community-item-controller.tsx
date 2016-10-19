import * as React from 'react';
import { Component } from 'react';
import * as Relay from 'react-relay';
import CommentList from 'pz-client/src/comments/comment-list-component';
import Votes from 'pz-client/src/votes/votes-component';
import Avatar from 'pz-client/src/user/avatar.component';
import CommunityItemContent from 'pz-client/src/community-item/community-item-content.component';
import Tags from 'pz-client/src/community-item/tags-component';
import { CreateCommentEditor } from 'pz-client/src/comments/comment-editor-component';
import { ISignInUpContext, SignInUpContextType } from 'pz-client/src/user/sign-in-up-overlay-component';
import CommentBubble from 'pz-client/src/community-item/widgets/community-item-comment-bubble-component';
import CommunityItemSchema from 'pz-client/src/community-item/widgets/community-item-schema-component';
import CommunityItemTypeHeader from 'pz-client/src/community-item/widgets/community-item-type-header-component';
import ReputationEarned from 'pz-client/src/widgets/reputation-earned-component';
import classNames from 'classnames';

interface IContext {
    showNotFoundError: any
}

export class CommunityItemController extends Component<ICommunityItemProps, ICommunityItemState> {
    static contextTypes: React.ValidationMap<any> = {
        showNotFoundError: React.PropTypes.func.isRequired,
        appViewerId: React.PropTypes.string.isRequired,
        signInUpContext: SignInUpContextType
    };

    context: {
        showNotFoundError: Function,
        appViewerId: number,
        signInUpContext: ISignInUpContext
    };

    constructor(props, context) {
        super(props, context);
        this.state = { isEditingComment: false };
    };

    render() {
        if (!this.props.communityItem) {
            this.context.showNotFoundError();
            return <span />;
        }

        const {communityItem} = this.props;

        const communityItemClasses = classNames('community-item', {
            'community-item-has-comments': this.props.communityItem.commentCount > 0
        });

        return (
            <div className="community-item-namespace" >
                <div className={communityItemClasses}>
                    <CommunityItemTypeHeader communityItem={communityItem} />

                    <div className="title">
                        {communityItem.summary}
                    </div>

                    <Avatar communityItem={communityItem} comment={null}
                        showReputation={true}
                        showTrusts={true}
                        showTrustButton={true} />

                    {this._renderCommunityItemContent(communityItem)}

                    {this._renderVoteAndTagSection(communityItem)}

                    {/*this._renderRelatedCommunityItems(communityItem)*/}

                    <div className="comment-container">
                        {this._renderCommentResponseSection(communityItem)}

                        {this._renderCommentList(communityItem)}
                    </div>

                    <CommunityItemSchema communityItem={communityItem} />
                </div>
            </div>
        )
    }

    private _renderCommunityItemContent(communityItem) {
        return (
            <div className="community-item-content-container">
                <CommunityItemContent communityItem={communityItem} />
            </div>
        );
    }

    private _renderVoteAndTagSection(communityItem) {
        return (
            <div className="vote-and-tags">
                {this._renderVotesOrReputation(communityItem)}

                <Tags topics={communityItem.topics} shouldRenderSingleTag={true} />
            </div>
        )
    }

    private _renderVotesOrReputation(communityItem) {
        if (communityItem.isMine) {
            return (
                <ReputationEarned
                    communityItem={communityItem} />
            );

        } else {

            return (
                <Votes
                    key={`communityItem-votes-${communityItem.id}`}
                    comment={null}
                    communityItem={communityItem} />
            );
        }
    }

    private _renderCommentResponseSection(communityItem) {
        return (
            <div className="comment-bubble-and-response">
                {!this.state.isEditingComment &&
                    <CommentBubble
                        onClick={this._toggleComments.bind(this)}
                        communityItem={this.props.communityItem}
                    />
                }

                <CreateCommentEditor
                    comment={null}
                    communityItem={communityItem}
                    onEditing={this._onEditingComment.bind(this)} />
            </div>
        )
    }

    private _renderCommentList(communityItem) {
        if (this.props.relay.variables.expandComments) {
            return (
                <CommentList
                    key={`communityItem-commentList-${communityItem.id}`}
                    communityItem={communityItem}
                    comment={null}
                    expandCommentsTo={this.props.relay.variables.expandCommentsTo}
                    currentLevel={0}
                    />
            )
        }
    }

    private _renderRelatedCommunityItems(communityItem) {
        return (
            <div className="related-community-items-container">
                <div className="related-community-item-container">
                    <div className="related-community-item">
                        <h4>This is why I'm switching to canon</h4>
                         <div style={{display:"flex"}}>
                        <Avatar communityItem={communityItem} comment={null}
                            showReputation={false}
                            showTrusts={true}
                            showTrust-button={false} />
                        <CommentBubble onClick={this._toggleComments.bind(this)} communityItem={this.props.communityItem} />
                    </div>
                    </div>
                </div>
                <div className="related-community-item-container">
                    <div className="related-community-item">
                        <h4>Test #2</h4>
                         <div style={{display:"flex"}}>
                        <Avatar communityItem={communityItem} comment={null}
                            showReputation={false}
                            showTrusts={true}
                            showTrust-button={false} />
                        <CommentBubble onClick={this._toggleComments.bind(this)} communityItem={this.props.communityItem} />
                    </div>
                    </div>
                </div>
                <div className="related-community-item-container">
                    <div className="related-community-item">
                        <h4>Test #3</h4>
                        <div style={{display:"flex"}}>
                            <Avatar communityItem={communityItem} comment={null}
                                showReputation={false}
                                showTrusts={true}
                                showTrust-button={false} />
                            <CommentBubble onClick={this._toggleComments.bind(this)} communityItem={this.props.communityItem} />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    private _onEditingComment(isEditingComment) {
        this.setState({ isEditingComment });
    }

    private _toggleComments() {
        this.props.relay.setVariables({
            expandComments: !this.props.relay.variables.expandComments
        })
    }
}

export default Relay.createContainer(CommunityItemController, {
    initialVariables: {
        expandCommentsTo: 10,
        expandComments: true
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
                commentCount
                isMine
                
                ${CommentList.getFragment('communityItem', { expandCommentsTo }).if(expandComments)}
                ${Avatar.getFragment('communityItem')}
                ${CommunityItemContent.getFragment('communityItem')}
                ${CreateCommentEditor.getFragment('communityItem')}
                ${Votes.getFragment('communityItem')}
                ${CommentBubble.getFragment('communityItem')}
                ${CommunityItemTypeHeader.getFragment('communityItem')}
                ${CommunityItemSchema.getFragment('communityItem')}
                ${ReputationEarned.getFragment('communityItem')}
            }
        `
    }
});

interface ICommunityItemState {
    isEditingComment?: boolean
}

interface ICommunityItemProps {
    params;
    communityItem?;
    relay;
}
