import * as React from 'react';
import * as Relay from 'react-relay';

import CreateCommunityItemForTopicMutation from 'pz-client/src/community-item/create-community-item-from-topic-mutation';
import CommunityItemEditor from 'pz-client/src/editor/community-item-editor.component';
import serializeEditorState from 'pz-client/src/editor/serialize-editor-state';
var classnames = require('classnames');

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
        id: number,
        name: string
    }
}

class Editor extends React.Component<IProps, any> {
    _timer: any;
    _delayedState = {};
    state = {
        summaryContent: '',
        bodyState: void(0),
        isEditing: false,
        summaryHasFocus: false,
        bodyHasFocus: false
    };
    saying = '';
    sayings = [
        `Say something about`,
        `Tell us some tips and tricks for`,
        `Share some tips and tricks for`,
        `Share something about`,
        `Review`,
        `Ask a question about`,
        `Ask your question about`,
    ];

    render() {
        return (
            <div className="community-item-editor">
                <form className="editor-form" onSubmit={this._saveCommunityItem.bind(this) }>
                    <input
                        className="editor-summary"
                        type="text"
                        placeholder={this._getRandomSaying() }
                        onChange={this._onSummaryChange.bind(this) }
                        onFocus={this._onSummaryFocus.bind(this) }
                        onBlur={this._onSummaryBlur.bind(this) }
                    />

                    {this._isEditing() &&
                        <div>
                            <CommunityItemEditor
                                placeholder="Elaborate here if you wish..."
                                onChange={this._onBodyChange.bind(this) }
                                onFocus={this._onBodyFocus.bind(this) }
                                onBlur={this._onBodyBlur.bind(this) }
                            />

                            <button className="submit">
                                <i className="save" />Post
                            </button>
                        </div>
                    }
                </form>
            </div>
        );
    }

    private _onSummaryFocus() {
        this._setStateDelayed({ summaryHasFocus: true });
    }

    private _onBodyFocus() {
        this._setStateDelayed({ bodyHasFocus: true });
    }

    private _onSummaryBlur() {
        this._setStateDelayed({ summaryHasFocus: false });
    }

    private _onBodyBlur() {
        this._setStateDelayed({ bodyHasFocus: false });
    }

    private _getRandomSaying() {
        if (this.saying !== '') return this.saying;
        var saying = this.sayings[Math.floor(Math.random() * (this.sayings.length - 1))];

        this.saying = `${saying} ${this.props.topic.name}...`
        return this.saying;
    }

    private _saveCommunityItem(event) {
        event.preventDefault();

        this.props.relay.commitUpdate(new CreateCommunityItemForTopicMutation({
            type: 'Question',
            topic: this.props.topic,

            summary: this.state.summaryContent,
            bodyData: serializeEditorState(this.state.bodyState)
        }));
    }

    private _onSummaryChange(event) {
        this.setState({ summaryContent: event.target.value });
    }

    private _onBodyChange(bodyState) {
        this.setState({ bodyState });
    }

    private _setStateDelayed(state) {
        if (this._timer != null) {
            clearTimeout(this._timer);
        }

        this._delayedState = Object.assign(this._delayedState, state);

        this._timer = setTimeout(() => {
            this.setState(this._delayedState);
        }, 50);
    }

    private _isEditing(): boolean {
        return (
            this.state.bodyHasFocus ||
            this.state.summaryHasFocus ||
            this.state.summaryContent.length > 0 ||
            (this.state.bodyState && this.state.bodyState.getCurrentContent().hasText()));
    }
}

export var CreateItemEditor = Relay.createContainer(Editor, {
    fragments: {
        topic: () => Relay.QL`
            fragment on Topic {
                id
                name
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
