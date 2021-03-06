import * as React from 'react';
import * as Relay from 'react-relay';

import EditorComponent from 'pz-client/src/editor/editor.component';
import serializeEditorState from 'pz-client/src/editor/serialize-editor-state';
import CurrentUserType from 'pz-client/src/user/current-user-type';
import { ISignInUpContext, SignInUpContextType } from 'pz-client/src/user/sign-in-up-overlay-component';
import CreateCommentMutation from 'pz-client/src/comments/create-comment-mutation';
import classNames from 'classnames';
import SignInUp from 'pz-client/src/user/sign-in-up-embedded-component';
import handleClick from 'pz-client/src/support/handle-click';
import GoogleTagManager from 'pz-client/src/support/google-tag-manager';

import {
    createPersistedDataComponent,
    createMemoryLoaders
} from 'pz-client/src/support/create-persisted-data-component';

interface IProps {
    persistedDataKey: any
    relay: any
    onEditing: Function
    communityItem?: any
    comment?: any
    className?: string
    persistedData?: {initialContent: any}
}

class CommentEditor extends React.Component<IProps, any> {
    static contextTypes: any = {
        appViewerId: React.PropTypes.string.isRequired,
        getCurrentUser: React.PropTypes.func,
        clearSessionData: React.PropTypes.func,
        signInUpContext: SignInUpContextType
    };

    context: {
        appViewerId: number,
        signInUpContext: ISignInUpContext
        clearSessionData: () => void
    };

    private _inputs: {
        editor?: any;
    } = {};

    private _hasInteractedWithSignInUp = false;
    private _hideEditorTimeout;

    render() {
        const classes = classNames('comment-editor', this.props.className, {
            'comment-editor-open': this.state.enableCommentEditor,
            'comment-editor-closed': !this.state.enableCommentEditor
        });

        return (
            <div className={classes}>
                {this._renderEditorOrReply()}
            </div>
        );
    }

    constructor(props, state) {
        super(props, state);

        this.state = {
            editorContent: null,
            enableCommentEditor: props.persistedData && props.persistedData.initialContent ?
                true : false
        };
    }

    componentWillUnmount() {
        if (this._hideEditorTimeout) {
            clearTimeout(this._hideEditorTimeout);
        }
    }

    componentWillRender() {
        this.setState({showSignInUp: !this.context.signInUpContext.isLoggedIn()});
    }

    private _renderEditorOrReply() {
        const {initialContent = void(0)} = this.props.persistedData || {};

        if (this.state.enableCommentEditor) {
            return (
                <div>
                    <form className="editor-form">
                        <EditorComponent
                            initialRawContentState={initialContent}
                            placeholder="Share your thoughts..."
                            onChange={this._updateEditor.bind(this)}
                            onBlur={this._hideEditor.bind(this)}
                            onFocus={this._showEditor.bind(this)}
                            ref={(editor) => this._inputs.editor = editor}
                            autoFocus={true}
                        />

                        <button
                            className="close-button"
                            onClick={handleClick(this._hideEditorImmediately.bind(this))}
                            tabIndex={-1}
                        />
                    </form>

                    {this.context.signInUpContext.isLoggedIn()
                        ? this._renderReplyButton()
                        : this._renderSignInUp()
                    }

                </div>
            )
        }
        else {
            return (
                <input type="text"
                    className="fake-reply-input"
                    onClick={this._showEditor.bind(this)}
                    onFocus={this._showEditor.bind(this)}
                    placeholder="Reply..." />
            )
        }
    }

    private _renderReplyButton() {
        return (
            <button className="reply-button" onClick={this._replyClicked.bind(this)}>
                Reply
            </button>
        );
    }

    private _renderSignInUp() {
        return (
            <SignInUp
                onInteraction={this._recordSignInUpInteraction.bind(this)}
                onSuccess={this._saveComment.bind(this)}
                submitText="Reply"
            />
        );
    }

    private _showEditor() {
        if (this._hideEditorTimeout) {
            clearTimeout(this._hideEditorTimeout);
        }

        this.setState({
            enableCommentEditor: true
        });

        if (this.props.onEditing) {
            this.props.onEditing(true);
        }
    }

    private _recordSignInUpInteraction() {
        this._hasInteractedWithSignInUp = true;
    }

    private _hideEditor() {
        this._hideEditorTimeout = setTimeout(() => {
            if (this.state.persistedData && this.state.persistedData.initialContent) {
                return;
            }

            if (this.state.editorContent.getCurrentContent().hasText()) {
                return;
            }

            if (this._hasInteractedWithSignInUp) {
                return;
            }

            this.setState({ enableCommentEditor: false });

            if (this.props.onEditing) {
                this.props.onEditing(false);
            }
        }, 100);
    }

    private _hideEditorImmediately() {
        this.setState({ enableCommentEditor: false });

        if (this.props.onEditing) {
            this.props.onEditing(false);
        }
    }

    private _replyClicked(event){
        event.preventDefault();
        this._saveComment();
    }

    private _saveComment() {
        GoogleTagManager.triggerComment();

        this.props.relay.commitUpdate(
            new CreateCommentMutation({
                bodyData: serializeEditorState(this.state.editorContent),
                comment: this.props.comment,
                communityItem: this.props.communityItem,
                appViewerId: this.context.appViewerId
            }), {
                onSuccess: () => {
                    this.setState({
                        editorContent: null,
                        enableCommentEditor: false
                    });

                    this.context.clearSessionData();

                    if (this.props.onEditing) {
                        this.props.onEditing(false);
                    }
                },
                onFailure: () => {
                    //TODO: Local error handling here
                }
            }
        );
    }

    private _updateEditor(editorContent) {
        this.setState({ editorContent });
    }
}

const [persister, reloader] = createMemoryLoaders(
    (element: any) => ({
        initialContent: element.state.editorContent ?
            serializeEditorState(element.state.editorContent)
            : null
    })
);

const PersistableCommentEditor = createPersistedDataComponent(
    CommentEditor,
    persister,
    reloader
);

export default Relay.createContainer(PersistableCommentEditor, {
    fragments: {
        comment: () => Relay.QL`
            fragment on Comment {
                id
                ${CreateCommentMutation.getFragment('comment')}
            }
        `,
        communityItem: () => Relay.QL`
            fragment on CommunityItemInterface {
                id
                ${CreateCommentMutation.getFragment('communityItem')}
            }
        `
    }
});
