import * as React from 'react';
import * as Relay from 'react-relay';

import EditorComponent from 'pz-client/src/editor/editor.component';
import serializeEditorState from 'pz-client/src/editor/serialize-editor-state';
import CurrentUserType from 'pz-client/src/user/current-user-type';
import SignInUpOverlay, { ISignInUpContext, SignInUpContextType } from 'pz-client/src/user/sign-in-up-overlay-component';

interface IProps {
    relay: any
    onSave: Function
    onEditing: Function
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

    componentDidUpdate() {
        if (this.state.enableCommentEditor)
            this._inputs.editor.focus();
    }

    render() {
        return (
            <div className="comment-editor">
                {this.state.enableCommentEditor
                    ? (<form className="editor-form" onSubmit={this._saveComment.bind(this)}>
                        <EditorComponent
                            placeholder="Share your thoughts..."
                            onChange={this._updateEditor.bind(this)}
                            onBlur={this._onBlur.bind(this)}
                            ref={(editor) => this._inputs.editor = editor}
                            />

                        <button className="submit" type="submit">Reply</button>
                    </form>)
                    : (<input type="text" className="reply-button" onClick={this._toggleEditor.bind(this)} placeholder="Reply..." />)
                }
            </div>
        );
    }

    private _toggleEditor(event) {
        if (!this.context.signInUpContext.isLoggedIn) {
            this.context.signInUpContext.showSignInUp(event);
            return;
        }

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

    private _saveComment(event) {
        event.preventDefault();

        if (this.props.onSave) {
            this.props.onSave(serializeEditorState(this.state.editorContent));
        }

        this.setState({ enableCommentEditor: false });

        if (this.props.onEditing) {
            this.props.onEditing(false);
        }
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
            }
        `,
        communityItem: () => Relay.QL`
            fragment on CommunityItem {
                id
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
