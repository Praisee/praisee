import * as React from 'react';
import * as Relay from 'react-relay';

import {
    CreateItemEditor,
    IEditorData
} from 'pz-client/src/community-item/community-item-editor.component';

import CreateCommunityItemMutation from 'pz-client/src/community-item/create-community-item-mutation';

export interface IProps {
    relay: any

    viewer: {
        id: any
    }

    topic: {
        id: any
        name: string
    }
}

class QuestionEditor extends React.Component<IProps, any> {
    render() {
        return (
            <CreateItemEditor
                className="question-editor"
                viewer={this.props.viewer}
                topic={this.props.topic}
                summaryPlaceholder={`Ask a question about ${this.props.topic.name}...`}
                showFullEditor={true}
                getMutationForSave={this._createQuestionMutation.bind(this)}
            />
        );
    }

    private _createQuestionMutation(editorData: IEditorData) {
        const {summary, bodyData} = editorData;

        return new CreateCommunityItemMutation({
            type: 'Question',
            viewer: this.props.viewer,
            topic: this.props.topic,
            summary,
            bodyData
        });
    }
}

export default Relay.createContainer(QuestionEditor, {
    fragments: {
        viewer: () => Relay.QL`
            fragment on Viewer {
                ${CreateItemEditor.getFragment('viewer')}
                ${CreateCommunityItemMutation.getFragment('viewer')}
                
                lastCreatedCommunityItem {
                    routePath
                }
            }
        `,

        topic: () => Relay.QL`
            fragment on Topic {
                id
                name
                ${CreateItemEditor.getFragment('topic')}
            }
        `
    }
});
