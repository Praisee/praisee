import * as React from 'react';
import { Component } from 'react';
import * as Relay from 'react-relay';
import CommentList from 'pz-client/src/comments/comment-list-component';
import Votes from 'pz-client/src/votes/votes-component';
import Avatar from 'pz-client/src/user/avatar.component';
import CommunityItemContent from 'pz-client/src/community-item/community-item-content.component';
import Tags from 'pz-client/src/community-item/tags-component';
import CreateCommentEditor from 'pz-client/src/comments/create-comment-editor-component';
import { ISignInUpContext, SignInUpContextType } from 'pz-client/src/user/sign-in-up-overlay-component';
import CommentBubble from 'pz-client/src/community-item/widgets/community-item-comment-bubble-component';
import CommunityItemSchema from 'pz-client/src/community-item/widgets/community-item-schema-component';
import CommunityItemTypeHeader from 'pz-client/src/community-item/widgets/community-item-type-header-component';
import ReputationEarned from 'pz-client/src/widgets/reputation-earned-component';
import classNames from 'classnames';
import {withRouter} from 'react-router';
import routePaths from 'pz-client/src/router/route-paths';
import SimpleModal from 'pz-client/src/widgets/simple-modal-component';
import handleClick from 'pz-client/src/support/handle-click';
import DestroyCommunityItemMutation from 'pz-client/src/community-item/destroy-community-item-mutation';
import {ContextMenu, ContextMenuOption} from 'pz-client/src/widgets/context-menu-component';

interface IContext {
    showNotFoundError: any
}

export class CommunityItemController extends Component<ICommunityItemProps, any> {
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

    state = {
        isEditingComment: false
    };

    refs: any;

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
                    {this._renderCommunityItemTypeHeader(communityItem)}

                    {this._renderSummary(communityItem)}

                    {this._renderAvatar()}

                    {this._renderCommunityItemContent(communityItem)}

                    {this._renderVoteAndTagSection(communityItem)}

                    {/*this._renderRelatedCommunityItems(communityItem)*/}

                    {this._renderCommentsSection(communityItem)}

                    {this._renderDeleteConfirmationModal(communityItem)}

                    {this._renderCommunityItemSchema(communityItem)}
                </div>
            </div>
        )
    }

    private _renderCommunityItemTypeHeader(communityItem) {
        return (
            <CommunityItemTypeHeader communityItem={communityItem} />
        );
    }

    private _renderSummary(communityItem) {
        return (
            <div className="community-item-title-container">
                <div className="title">
                    {communityItem.summary}
                </div>

                {this._renderMenu(communityItem)}
            </div>
        );
    }

    private _renderAvatar() {
        return (
            <Avatar
                communityItem={this.props.communityItem} comment={null}
                showReputation={true}
                showTrusts={true}
                showTrustButton={true}
            />
        );
    }

    private _renderCommunityItemContent(communityItem) {
        return (
            <div className="community-item-content-container">
                <CommunityItemContent communityItem={communityItem} />
            </div>
        );
    }

    private _renderMenu(communityItem) {
        if (!communityItem.belongsToCurrentUser) {
            return;
        }

        return (
            <ContextMenu className="community-item-menu">
                <ContextMenuOption className="edit-community-item"
                                   onClick={this._editCommunityItem.bind(this)}>

                    Edit
                </ContextMenuOption>

                <ContextMenuOption className="delete-community-item"
                                   onClick={() => this.refs.deleteConfirmation.show()}>
                    Delete
                </ContextMenuOption>
            </ContextMenu>
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
        if (communityItem.belongsToCurrentUser) {
            return (
                <ReputationEarned
                    comment={null}
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

    private _renderCommentsSection(communityItem) {
        return (
            <div className="comment-container">
                {this._renderCommentResponseSection(communityItem)}

                {this._renderCommentList(communityItem)}
            </div>
        );
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

    private _renderDeleteConfirmationModal(communityItem) {
        if (!communityItem.belongsToCurrentUser) {
            return;
        }

        // const onDelete = handleClick(() => {
        //     this._deleteCommunityItem();
        //     this.refs.deleteConfirmation.hide();
        // });

        const onCancel = handleClick(() => this.refs.deleteConfirmation.hide());

        return (
            <SimpleModal className="app-community-item-delete-confirmation"
                         ref="deleteConfirmation">

                <div className="delete-confirmation-content">
                    Unfortunately we do not support this feature yet. If you would
                    like to delete your item, please edit it and remove the content
                    instead for now. Sorry for the inconvenience.

                    <div className="delete-confirmation-options">
                        <button className="delete-confirmation-delete-button"
                                onClick={this._editCommunityItem.bind(this)}>

                            Edit Post
                        </button>

                        <button className="delete-confirmation-cancel-button"
                                onClick={onCancel}>

                            Cancel
                        </button>
                    </div>

                    {/*Are you sure you want to permanently delete this item? All comments*/}
                    {/*will also be removed.*/}

                    {/*<div className="delete-confirmation-options">*/}
                        {/*<button className="delete-confirmation-delete-button"*/}
                                {/*onClick={onDelete}>*/}

                            {/*Delete Post*/}
                        {/*</button>*/}

                        {/*<button className="delete-confirmation-cancel-button"*/}
                                {/*onClick={onCancel}>*/}

                            {/*Cancel*/}
                        {/*</button>*/}
                    {/*</div>*/}
                </div>
            </SimpleModal>
        );
    }

    private _renderCommunityItemSchema(communityItem) {
        return (
            <CommunityItemSchema communityItem={communityItem} />
        );
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

    private _editCommunityItem() {
        this.props.router.push(routePaths.communityItem.edit(this.props.communityItem.id))
    }

    private _deleteCommunityItem() {
        const mutation = new DestroyCommunityItemMutation({
            viewerId: this.context.appViewerId,
            communityItem: this.props.communityItem
        });

        this.props.relay.commitUpdate(mutation);

        // TODO: This should redirect to the previous Praisee page, if there was one
        this.props.router.push(routePaths.index());
    }
}

export default Relay.createContainer(withRouter(CommunityItemController), {
    initialVariables: {
        expandCommentsTo: 10,
        expandComments: true
    },
    fragments: {
        communityItem: ({expandCommentsTo, expandComments}) => Relay.QL`
            fragment on CommunityItemInterface {
                id
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
                belongsToCurrentUser
                
                ${CommentList.getFragment('communityItem', { expandCommentsTo }).if(expandComments)}
                ${Avatar.getFragment('communityItem')}
                ${CommunityItemContent.getFragment('communityItem')}
                ${CreateCommentEditor.getFragment('communityItem')}
                ${Votes.getFragment('communityItem')}
                ${CommentBubble.getFragment('communityItem')}
                ${CommunityItemTypeHeader.getFragment('communityItem')}
                ${CommunityItemSchema.getFragment('communityItem')}
                ${DestroyCommunityItemMutation.getFragment('communityItem')}
                ${ReputationEarned.getFragment('communityItem')}
            }
        `
    }
});

interface ICommunityItemProps {
    params;
    communityItem?;
    relay;

    router: {
        push: Function
    }
}
