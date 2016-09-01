import * as React from 'react';
import * as Relay from 'react-relay';

import CreateCommunityItemForTopicMutation from 'pz-client/src/community-item/create-community-item-from-topic-mutation';
import EditorComponent from 'pz-client/src/editor/editor.component';
import CommunityItemContent from 'pz-client/src/editor/community-item-content.component';
import serializeEditorState from 'pz-client/src/editor/serialize-editor-state';

interface IProps {
    relay: any

    communityItem?: {
        id: number
        type: string,
        summary: string,
        body: string,
        topic: any
    }

    topic?: {
        id
    }
}

class Editor extends React.Component<IProps, any> {
    state = {
        summary: '',
        editorState: null
    };

    render() {
        return (
            <div className="community-item-editor-namespace">
                <form className="editor-form" onSubmit={this._saveCommunityItem.bind(this)}>
                    <input
                        className="editor-summary"
                        type="text"
                        placeholder="Summary"
                        onChange={this._updateSummary.bind(this)}
                        value={this.state.summary}
                    />

                    <EditorComponent
                        placeholder="Write something about Topic..."
                        onChange={this._updateEditor.bind(this)}
                    />

                    <button>Save</button>
                </form>
            </div>
        );
    }

    private _saveCommunityItem(event) {
        event.preventDefault();

        this.props.relay.commitUpdate(new CreateCommunityItemForTopicMutation({
            type: 'Question',
            summary: this.state.summary,

            bodyData: serializeEditorState(this.state.editorState),
            topic: this.props.topic
        }));
    }

    private _updateEditor(editorState) {
        this.setState({editorState});
    }

    private _updateSummary(event) {
        this.setState({summary: event.target.value});
    }
}

export let CreateItemEditor = Relay.createContainer(Editor, {
    fragments: {
        topic: () => Relay.QL`
            fragment on Topic {
                id
                ${CreateCommunityItemForTopicMutation.getFragment('topic')}
            }
        `
    }
});

export var UpdateItemEditor = Relay.createContainer(Editor, {
    fragments: {
        review: () => Relay.QL`
            fragment on CommunityItem {
                id,
                type,
                summary,
                body
            }
        `
    }
});
