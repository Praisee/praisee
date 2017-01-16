import {Component} from 'react';
import * as React from 'react';
import * as Relay from 'react-relay';
import SchemaInjector, {ISchemaType} from 'pz-client/src/support/schema-injector';
import {DateDisplay} from 'pz-client/src/widgets/date-display.component'
import ExpandButton from 'pz-client/src/widgets/expand-button-component'
import CommentContent from 'pz-client/src/comments/comment-content-component';
import CommentList from 'pz-client/src/comments/comment-list-component';
import Avatar from 'pz-client/src/user/avatar.component';
import CreateCommentEditor from 'pz-client/src/comments/create-comment-editor-component';
import Votes from 'pz-client/src/votes/votes-component';
import CurrentUserType from 'pz-client/src/user/current-user-type';
import {SignInUpContextType, ISignInUpContext} from 'pz-client/src/user/sign-in-up-overlay-component';
import {ContextMenu, ContextMenuOption} from 'pz-client/src/widgets/context-menu-component';
import handleClick from 'pz-client/src/support/handle-click';
import SimpleModal from 'pz-client/src/widgets/simple-modal-component';
import UpdateCommentEditor from 'pz-client/src/comments/update-comment-editor-component';
import ReputationEarned from 'pz-client/src/widgets/reputation-earned-component';

export interface ICommentProps {
    comment: {
        id
        createdAt: Date
        commentCount: number
        belongsToCurrentUser: boolean

        user: {
            id
        }
    }

    relay
}

export class Comment extends Component<ICommentProps, any>{
    static contextTypes: any = {
        appViewerId: React.PropTypes.string.isRequired,
        signInUpContext: SignInUpContextType
    };

    context: {
        appViewerId: number,
        signInUpContext: ISignInUpContext
    };

    schemaInjector: SchemaInjector;

    refs: any;

    state = {
        isEditingComment: false,
        isCreatingComment: false
    };

    constructor(props, context) {
        super(props, context);
        this.schemaInjector = new SchemaInjector(commentSchema);
    }

    render() {
        return this.schemaInjector.inject(
            <div className="comment">
                {this._renderHeader()}
                {this._renderBody()}
                {this._renderChildComments()}
                {this._renderDeleteConfirmationModal()}
            </div>
        );
    }

    private _renderHeader() {
        return (
            <div className="comment-header">
                <div className="comment-header-primary">
                    <Avatar
                        communityItem={null} comment={this.props.comment}
                        showReputation={true}
                        showTrusts={true}
                        showTrustButton={true}
                        />
                </div>

                <div className="comment-header-secondary">
                    <DateDisplay
                        date={this.props.comment.createdAt}
                        type="date-created"
                        />

                    {this._renderMenu()}
                </div>
            </div>
        );
    }

    private _renderMenu() {
        if (!this.props.comment.belongsToCurrentUser) {
            return;
        }

        return (
            <ContextMenu className="community-item-menu">
                <ContextMenuOption className="edit-community-item"
                    onClick={this._editComment.bind(this)}>

                    Edit
                </ContextMenuOption>

                <ContextMenuOption className="delete-community-item"
                    onClick={() => this.refs.deleteConfirmation.show()}>
                    Delete
                </ContextMenuOption>
            </ContextMenu>
        );
    }

    private _renderBody() {
        return (
            <div className="comment-inner">
                {this._renderContent()}

                <div className="comment-bottom">
                    {this._renderVotesOrReputation()}

                    <CreateCommentEditor
                        persistedDataKey={'comment-' + this.props.comment.id}
                        comment={this.props.comment}
                        communityItem={null}
                        onEditing={this._onCreatingComment.bind(this)} />
                </div>

                {this._renderExpandButton()}
            </div>
        );
    }

    private _renderContent() {
        if (!this.state.isEditingComment) {
            return (
                <CommentContent comment={this.props.comment} />
            );

        } else {
            return (
                <UpdateCommentEditor
                    comment={this.props.comment}
                    onCloseEditor={this._closeCommentEditor.bind(this)}
                    />
            );
        }
    }

    private _renderVotesOrReputation() {
        if (this.state.isCreatingComment) {
            return;
        }

        if (this.props.comment.belongsToCurrentUser) {
            return (
                <ReputationEarned
                    comment={this.props.comment}
                    communityItem={null} />
            );

        } else {
            return (
                <Votes
                    key={`comment-votes-${this.props.comment.id}`}
                    comment={this.props.comment}
                    communityItem={null}
                    />
            );
        }
    }

    private _renderExpandButton() {
        const isExpanded = this.props.relay.variables.expand;

        if (isExpanded || this.props.comment.commentCount < 1) {
            return;
        }

        return (
            <ExpandButton onExpand={this._expand.bind(this)} isExpanded={false} />
        );
    }

    private _renderChildComments() {
        const {currentDepth, expand} = this.props.relay.variables;

        if (!expand) {
            return;
        }

        return (
            <CommentList
                key={`comment-commentList-${this.props.comment.id}`}
                comment={this.props.comment}
                communityItem={null}
                currentDepth={currentDepth}
                />
        );
    }

    private _renderDeleteConfirmationModal() {
        if (!this.props.comment.belongsToCurrentUser) {
            return;
        }

        // const onDelete = handleClick(() => {
        //     this._deleteCommunityItem();
        //     this.refs.deleteConfirmation.hide();
        // });

        const onCancel = handleClick(() => this.refs.deleteConfirmation.hide());

        return (
            <SimpleModal className="app-comment-delete-confirmation"
                ref="deleteConfirmation">

                <div className="delete-confirmation-content">
                    Unfortunately we do not support this feature yet. If you would
                    like to delete your item, please edit it and remove the content
                    instead for now. Sorry for the inconvenience.

                    <div className="delete-confirmation-options">
                        <button className="delete-confirmation-delete-button"
                            onClick={this._editComment.bind(this)}>

                            Edit Comment
                        </button>

                        <button className="delete-confirmation-cancel-button"
                            onClick={onCancel}>

                            Cancel
                        </button>
                    </div>

                    {/*Are you sure you want to permanently delete this item?*/}

                    {/*<div className="delete-confirmation-options">*/}
                    {/*<button className="delete-confirmation-delete-button"*/}
                    {/*onClick={onDelete}>*/}

                    {/*Delete Comment*/}
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

    private _expand() {
        this.props.relay.setVariables({
            expand: !this.props.relay.variables.expand
        });
    }

    private _onCreatingComment(isCreatingComment) {
        this.setState({ isCreatingComment });
    }

    private _editComment() {
        this.setState({isEditingComment: true});
    }

    private _closeCommentEditor() {
        this.setState({isEditingComment: false});
    }
}

export default Relay.createContainer(Comment, {
    initialVariables: {
        expand: false,
        currentDepth: 1
    },
    fragments: {
        comment: ({expand, currentDepth}) => Relay.QL`
            fragment on Comment {
                id
                createdAt
                commentCount 
                belongsToCurrentUser
                reputationEarned
                
                user {
                    id
                }
                
                ${CommentContent.getFragment('comment')}
                ${UpdateCommentEditor.getFragment('comment')}
                ${Avatar.getFragment('comment')}
                ${CommentList.getFragment('comment', { currentDepth }).if(expand)}
                ${CreateCommentEditor.getFragment('comment')}
                ${Votes.getFragment('comment')}
                ${ReputationEarned.getFragment('comment')}
            } 
        `
    }
});

var commentSchema: ISchemaType = {
    "comment": {
        property: "comment",
        typeof: "Comment"
    },
    "text": {
        property: "text"
    },
    "votes": {
        property: "aggregateRating",
        typeof: "AggregateRating"
    },
    "downvote-count":
    {
        property: "downvoteCount"
    },
    "upvote-count": {
        property: "upvoteCount"
    },
    "parent-item": {
        property: "parentItem"
    },
    "date-created": {
        property: "dateCreated"
    }
};
