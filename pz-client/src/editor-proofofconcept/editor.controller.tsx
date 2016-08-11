import * as React from 'react';
import * as Relay from 'react-relay';

import {
    EditorState as DraftJsEditorState,
    RichUtils,
    convertToRaw
} from 'draft-js';

import CreateCommunityItemMutation from 'pz-client/src/editor-proofofconcept/create-community-item-mutation';

var DraftJsEditor = require('draft-js-plugins-editor').default;
var createToolbarPlugin = require('draft-js-toolbar-plugin').default;
var createLinkifyPlugin = require('draft-js-linkify-plugin').default;

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
    private _editorPlugins = [
        createToolbarPlugin({clearTextActions: true}),
        createLinkifyPlugin()
    ];

    constructor(props, state) {
        super(props, state);

        this.state = {
            summary: '',
            editorState: DraftJsEditorState.createEmpty()
        };
    }

    render() {
        const myCommunityItems = this.props.viewer.myCommunityItems.edges;
        const {editorState} = this.state;

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

                    <div className="editor-area">
                        <DraftJsEditor
                            editorState={editorState}
                            handleKeyCommand={this._updateRichStylingFromCommand.bind(this)}
                            onChange={this._updateEditor.bind(this)}
                            placeholder="Write something about Topic..."
                            plugins={this._editorPlugins}
                        />
                    </div>

                    <button>Save</button>
                </form>

                <div>
                    Community Items:
                    <ul>
                        {myCommunityItems.map(({node: communityItem}) => (
                            <li key={communityItem.id}>
                                <h3>{communityItem.summary}</h3>
                                <div>{communityItem.body}</div>
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
            type: 'question',
            summary: this.state.summary,

            bodyData: {
                type: 'draftjs',
                version: '0.8.0',
                isJson: true,
                value: JSON.stringify(convertToRaw(this.state.editorState.getCurrentContent()))
            },

            viewer: this.props.viewer
        }));
    }

    private _updateEditor(editorState) {
        console.log(convertToRaw(editorState.getCurrentContent()));
        this.setState({editorState});
    }

    private _updateRichStylingFromCommand(command) {
        const newState = RichUtils.handleKeyCommand(this.state.editorState, command);

        if (newState) {
            this._updateEditor(newState);
            return true;
        }

        return false;
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
                            body
                        }
                    }
                },
                
                ${CreateCommunityItemMutation.getFragment('viewer')}
            }
        `
    }
});

export let UpdateItemEditor = Relay.createContainer(Editor, {
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
