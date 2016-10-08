import * as React from 'react';
import * as Relay from 'react-relay';

import EditorComponent from 'pz-client/src/editor/editor.component';
import serializeEditorState from 'pz-client/src/editor/serialize-editor-state';
import CurrentUserType from 'pz-client/src/user/current-user-type';
import { ISignInUpContext, SignInUpContextType } from 'pz-client/src/user/sign-in-up-overlay-component';
import CreateCommentMutation from 'pz-client/src/comments/create-comment-mutation';
import classNames from 'classnames';
import SignInUp from 'pz-client/src/user/sign-in-up-embedded-component';

interface IProps {
    relay: any
    onEditing: Function
    communityItem?: any
    comment?: any
    className?: string
}

class Editor extends React.Component<IProps, any> {
    static contextTypes: any = {
        appViewerId: React.PropTypes.string.isRequired,
        currentUser: CurrentUserType,
        signInUpContext: SignInUpContextType
    };

    context: {
        appViewerId: number,
        currentUser: any,
        signInUpContext: ISignInUpContext
    }

    state = {
        editorContent: null,
        enableCommentEditor: false
    };

    private _inputs: {
        editor?: any;
    } = {};

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

    private _renderEditorOrReply() {
        if (this.state.enableCommentEditor) {
            return (
                <div>
                    <form className="editor-form">
                        <EditorComponent
                            placeholder="Share your thoughts..."
                            onChange={this._updateEditor.bind(this)}
                            onBlur={this._onBlur.bind(this)}
                            ref={(editor) => this._inputs.editor = editor}
                            autoFocus={true}
                            />
                    </form>
                    {this.context.signInUpContext.isLoggedIn 
                        ? <button onClick={this._replyClicked.bind(this)}>Reply</button> 
                        : this._renderSignInUp()
                    }
                    
                </div>
            )
        }
        else {
            return (
                <input type="text"
                    className="reply-button"
                    onClick={this._toggleEditor.bind(this)}
                    placeholder="Reply..." />
            )
        }
    }

    private _renderSignInUp() {
        return (
            <SignInUp onSuccess={this._saveComment.bind(this)} 
                submitText="Reply" />
        );
    }

    private _toggleEditor(event) {
        this.setState({ enableCommentEditor: true });

        if (this.props.onEditing) {
            this.props.onEditing(true);
        }
    }

    private _onBlur(event) {
        if (!this.state.editorContent.getCurrentContent().hasText()) {
            this.setState({ enableCommentEditor: false });

            if (this.props.onEditing) {
                this.props.onEditing(false);
            }
        }
    }
    
    private _replyClicked(event){
        event.preventDefault();
        this._saveComment();
    }

    private _saveComment() {
        this.props.relay.commitUpdate(
            new CreateCommentMutation({
                bodyData: serializeEditorState(this.state.editorContent),
                comment: this.props.comment,
                communityItem: this.props.communityItem,
                appViewerId: this.context.appViewerId
            }), {
                onSuccess: () => {
                    this.setState({ enableCommentEditor: false });

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

export let CreateCommentEditor = Relay.createContainer(Editor, {
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

export var UpdateItemEditor = Relay.createContainer(Editor, {
    fragments: {
        comment: () => Relay.QL`
            fragment on Comment {
                id,
                body
            }
        `
    }
});
