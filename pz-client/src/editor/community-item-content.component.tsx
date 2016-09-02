import * as React from 'react';
import * as Relay from 'react-relay';

import {
    EditorState,
    RichUtils,
    convertFromRaw
} from 'draft-js';

import createMentionPlugin from 'pz-client/src/editor/mention-plugin/create-mention-plugin';
import createDecoratorFromPlugins from 'pz-client/src/editor/create-decorator-from-plugins';
import {isTextContent} from 'pz-server/src/content/content-data';
import convertToText from 'pz-server/src/content/data-to-text-converter';

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
        let {bodyData} = this.props.communityItem;

        let content;
        let bodyDataAsObj = JSON.parse(bodyData);
        if (isTextContent(bodyDataAsObj)) {
            content = (<p>{convertToText(bodyDataAsObj)}</p>);
        }
        else {
            content = (
                <DraftJsEditor
                    readOnly={true}
                    editorState={this._getEditorState()}
                    onChange={() => {}}
                    plugins={this._editorPlugins}
                    />
            );
        }

        return (
            <div className="community-item-content">
                {content}
            </div>
        );
    }

    private _getEditorState() {
        const contentData = JSON.parse(this.props.communityItem.bodyData);

        const decorator = createDecoratorFromPlugins(this._editorPlugins);

        const editorState = EditorState.createWithContent(
            convertFromRaw(contentData.value),
            decorator
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
