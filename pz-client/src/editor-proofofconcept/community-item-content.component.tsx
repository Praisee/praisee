import * as React from 'react';
import * as Relay from 'react-relay';

import {
    EditorState,
    RichUtils,
    convertFromRaw,
    CompositeDecorator
} from 'draft-js';

import createMentionPlugin from 'pz-client/src/editor-proofofconcept/plugins/mention/create-mention-plugin';

var DraftJsEditor = require('draft-js-plugins-editor').default;
var createLinkifyPlugin = require('draft-js-linkify-plugin').default;

export interface IProps {
    communityItem: {
        bodyData: any
    }
}

const mentionPlugin = createMentionPlugin();

export class CommunityItemContent extends React.Component<IProps, any> {
    private _editorPlugins = [
        createLinkifyPlugin({target: 'noopener noreferrer'}),
        mentionPlugin
    ];

    render() {
        return (
            <div className="community-item-content">
                <DraftJsEditor
                    readOnly={true}
                    editorState={this._getEditorState()}
                    onChange={() => {}}
                    plugins={this._editorPlugins}
                />
            </div>
        );
    }

    private _getEditorState() {
        const contentData = JSON.parse(this.props.communityItem.bodyData);

        const decorators = this._editorPlugins.reduce((decorators, plugin) => {
            if (!plugin.decorators) {
                return decorators;
            }

            return [...decorators, ...plugin.decorators];
        });

        const editorState = EditorState.createWithContent(
            convertFromRaw(contentData.value),
            new CompositeDecorator(decorators)
        );

        return editorState;
    }
}

export default Relay.createContainer(CommunityItemContent, {
    fragments: {
        communityItem: () => Relay.QL`
            fragment on CommunityItem {
                bodyData
            }
        `
    }
});
