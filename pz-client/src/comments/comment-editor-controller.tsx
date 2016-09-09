import * as React from 'react';
import * as Relay from 'react-relay';

import CreateCommentForCommunityItemMutation from 'pz-client/src/comments/create-comment-for-community-item-mutation';
import CreateCommentForCommentMutation from 'pz-client/src/comments/create-comment-for-comment-mutation';
import EditorComponent from 'pz-client/src/editor/editor.component';
import CommunityItemContent from 'pz-client/src/editor/community-item-content.component';
import serializeEditorState from 'pz-client/src/editor/serialize-editor-state';

interface IProps {
    relay: any

    comment?: {
        id: number
        body: string,
    }
}

class Editor extends React.Component<IProps, any> {
    state = {
        editorState: null,
        enableCommentEditor: false
    };

    render() {
        return (
            <div className="comment-editor-namespace">
                { this.state.enableCommentEditor
                    ? (<form className="editor-form" onSubmit={this._saveComment.bind(this) }>
                            <EditorComponent
                                placeholder="Write something about this comment..."
                                onChange={this._updateEditor.bind(this) }
                                />

                            <button>Save</button>
                        </form>)
                    : (<span onClick={this._enableCommentEditor.bind(this)}>Add a comment...</span>)
                }
            </div>
        );
    }

    private _enableCommentEditor(event) {
        this.setState({ enableCommentEditor: true });
    }

    private _saveComment(event) {
        event.preventDefault();

        this.props.relay.commitUpdate(new CreateCommentForCommentMutation({
            bodyData: serializeEditorState(this.state.editorState),
            comment: this.props.comment
        }));
    }

    private _updateEditor(editorState) {
        this.setState({ editorState });
    }
}

export let CreateCommentEditor = Relay.createContainer(Editor, {
    fragments: {
        comment: () => Relay.QL`
            fragment on Comment {
                id
                ${CreateCommentForCommentMutation.getFragment('comment')}
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
