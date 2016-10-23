import * as React from 'react';
import * as Relay from 'react-relay';

import EditorComponent from 'pz-client/src/editor/editor.component';
import serializeEditorState from 'pz-client/src/editor/serialize-editor-state';
import classNames from 'classnames';
import handleClick from 'pz-client/src/support/handle-click';
import UpdateCommentMutation from 'pz-client/src/comments/update-comment-mutation';

interface IProps {
    relay: any

    comment: {
        id
        bodyData
    }

    className?: string

    onCloseEditor?: () => any
}

class Editor extends React.Component<IProps, any> {
    state = {
        editorContent: null
    };

    render() {
        const classes = classNames('comment-editor', this.props.className);

        return (
            <div className={classes}>
                <form className="editor-form">
                    <EditorComponent
                        placeholder="Share your thoughts..."
                        initialRawContentState={this.props.comment.bodyData}
                        onChange={this._updateEditor.bind(this)}
                        autoFocus={true}
                    />

                    <button
                        className="close-button"
                        onClick={handleClick(this._onCloseEditor.bind(this))}
                        tabIndex={-1}
                    />
                </form>

                <button className="save-button" onClick={this._saveComment.bind(this)}>
                    Save
                </button>
            </div>
        );
    }

    private _saveComment() {
        this.props.relay.commitUpdate(new UpdateCommentMutation({
            comment: this.props.comment,
            bodyData: serializeEditorState(this.state.editorContent)
        }));

        this._onCloseEditor();
    }

    private _updateEditor(editorContent) {
        this.setState({ editorContent });
    }

    private _onCloseEditor() {
        if (this.props.onCloseEditor) {
            this.props.onCloseEditor();
        }
    }
}

export default Relay.createContainer(Editor, {
    fragments: {
        comment: () => Relay.QL`
            fragment on Comment {
                id
                bodyData
                
                ${UpdateCommentMutation.getFragment('comment')}
            }
        `,
    }
});
