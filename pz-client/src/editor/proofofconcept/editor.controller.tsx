import * as React from 'react';
import * as Relay from 'react-relay';

import CreateCommunityItemMutation from 'pz-client/src/editor/proofofconcept/create-community-item-mutation';
import EditorComponent from 'pz-client/src/editor/editor.component';
import CommunityItemContent from 'pz-client/src/editor/community-item-content.component';
import serializeEditorState from 'pz-client/src/editor/serialize-editor-state';

interface IProps {
    relay: any

    communityItem?: {
        id: number
        type: string,
        summary: string,
        body: string
    }

    viewer?: {
        myCommunityItems: {
            edges: Array<{
                node: {
                    id: number,
                    summary: string,
                    body: string
                }
            }>
        }
    }
}

class Editor extends React.Component<IProps, any> {
    state = {
        summary: '',
        editorState: null
    };

    render() {
        const myCommunityItems = this.props.viewer.myCommunityItems.edges;

        return (
            <div className="editor-proofofconcept-namespace">
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

                <div>
                    Community Items:
                    <ul>
                        {myCommunityItems.map(({node: communityItem}) => (
                            <li key={communityItem.id}>
                                <h3>{communityItem.summary}</h3>
                                <div>
                                    <CommunityItemContent communityItem={communityItem} />
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    }

    private _saveCommunityItem(event) {
        event.preventDefault();

        this.props.relay.commitUpdate(new CreateCommunityItemMutation({
            type: 'Question',
            summary: this.state.summary,

            bodyData: serializeEditorState(this.state.editorState),

            viewer: this.props.viewer
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
        viewer: () => Relay.QL`
            fragment on Viewer {
                myCommunityItems(last: 10) {
                    edges {
                        node {
                            id,
                            type,
                            summary,
                            ${CommunityItemContent.getFragment('communityItem')}
                        }
                    }
                },
                
                ${CreateCommunityItemMutation.getFragment('viewer')}
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
