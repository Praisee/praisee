import * as React from 'react';
import * as Relay from 'react-relay';

import {
    CreateItemEditor,
    IEditorData
} from 'pz-client/src/community-item/community-item-editor.component';

import CreateCommunityItemForTopicMutation from 'pz-client/src/community-item/create-community-item-from-topic-mutation';

export interface IProps {
    relay: any

    topic: {
        id: number
        name: string
    }
}

class QuestionEditor extends React.Component<IProps, any> {
    render() {
        return (
            <CreateItemEditor
                className="question-editor"
                topic={this.props.topic}
                summaryPlaceholder={`Ask a question about ${this.props.topic.name}...`}
                showFullEditor={true}
                onSave={this._createQuestion.bind(this)}
            />
        );
    }

    private _createQuestion(editorData: IEditorData) {
        const {summary, bodyData} = editorData;

        this.props.relay.commitUpdate(new CreateCommunityItemForTopicMutation({
            type: 'Question',
            topic: this.props.topic,
            summary,
            bodyData
        }));
    }
}

export default Relay.createContainer(QuestionEditor, {
    fragments: {
        topic: () => Relay.QL`
            fragment on Topic {
                id
                name
                ${CreateItemEditor.getFragment('topic')}
                ${CreateCommunityItemForTopicMutation.getFragment('topic')}
            }
        `
    }
});
