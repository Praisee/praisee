import * as React from 'react';
import * as Relay from 'react-relay';

import CurrentUserType from 'pz-client/src/user/current-user-type';
import SignInUpOverlay, { ISignInUpContext, SignInUpContextType } from 'pz-client/src/user/sign-in-up-overlay-component';
import CreateCommunityItemForTopicMutation from 'pz-client/src/community-item/create-community-item-from-topic-mutation';
import CommunityItemBodyEditor from 'pz-client/src/community-item/community-item-body-editor.component';
import serializeEditorState from 'pz-client/src/editor/serialize-editor-state';
import classNames from 'classnames';
import {withRouter} from 'react-router';
import SignInUp from 'pz-client/src/user/sign-in-up-embedded-component';
import handleClick from 'pz-client/src/support/handle-click';

export interface IEditorData {
    summary: string
    bodyData: any
}

export interface IProps {
    viewer: {
        lastCreatedCommunityItem: {
            routePath
        }
    }

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

    summaryPlaceholder?: string

    showFullEditor?: boolean

    onSave?: (editorData: IEditorData) => any
    getMutationForSave?: (editorData: IEditorData) => any

    className?: string

    relay: any

    router: {
        push: Function
    }
}

class CommunityItemEditor extends React.Component<IProps, any> {
    render() {
        const classes = classNames('community-item-editor', this.props.className, {
            'community-item-editor-full-editor': this._shouldShowFullEditor()
        });

        return (
            <div className={classes}>
                <div className="editor-container">
                    {this._renderSummary()}
                    {this._renderBody()}
                </div>

                {this._renderSignInUp()}
            </div>
        );
    }

    private _delayedStateTimer: any;
    private _delayedState = {};

    static contextTypes: any = {
        signInUpContext: SignInUpContextType
    };

    context: {
        signInUpContext: ISignInUpContext
    };

    state = {
        summaryContent: '',
        bodyState: void(0),
        summaryHasFocus: false,
        bodyHasFocus: false
    };

    private _saying = void(0);

    private _hasInteractedWithSignInUp = false;

    componentWillUnmount() {
        if (this._delayedStateTimer) {
            clearTimeout(this._delayedStateTimer);
        }
    }

    private _renderSummary() {
        const classes = classNames('editor-summary', {
            'has-input': this.state.summaryContent && this.state.summaryContent.length
        });

        return (
            <input
                className={classes}
                type="text"
                placeholder={this._getSummaryPlaceholder() }
                onChange={this._onSummaryChange.bind(this) }
                onFocus={this._onSummaryFocus.bind(this) }
                onBlur={this._onSummaryBlur.bind(this) }
            />
        );
    }

    private _renderBody() {
        if (!this._shouldShowFullEditor()) {
            return;
        }

        return (
            <div>
                <CommunityItemBodyEditor
                    placeholder="Elaborate here if you wish..."
                    onChange={this._onBodyChange.bind(this) }
                    onFocus={this._onBodyFocus.bind(this) }
                    onBlur={this._onBodyBlur.bind(this) }
                />

                {this.context.signInUpContext.isLoggedIn &&
                    this._renderPostButton()
                }
            </div>
        )
    }

    private _renderPostButton() {
        return (
            <button className="post-button"
                    onClick={handleClick(this._saveCommunityItem.bind(this))}>

                <i className="save-icon" />Post
            </button>
        );
    }

    private _renderSignInUp() {
        if (!this._shouldShowFullEditor() || this.context.signInUpContext.isLoggedIn) {
            return;
        }

        return (
            <SignInUp
                onInteraction={this._recordSignInUpInteraction.bind(this)}
                onSuccess={this._saveCommunityItem.bind(this)}
                submitText="Post"
            />
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

    private _getSummaryPlaceholder() {
        return this.props.summaryPlaceholder || this._getRandomSaying();
    }

    private _getRandomSaying() {
        if (this._saying) {
            return this._saying;
        }

        const sayings = [
            `Say something about`,
            `Tell us some tips and tricks for`,
            `Share some tips and tricks for`,
            `Share something about`,
            `Review`,
            `Ask a question about`,
            `Ask your question about`,
        ];

        var randomSaying = sayings[Math.floor(Math.random() * (sayings.length - 1))];

        this._saying = `${randomSaying} ${this.props.topic.name}...`;
        return this._saying;
    }

    private _saveCommunityItem() {
        const editorData = {
            summary: this.state.summaryContent,
            bodyData: serializeEditorState(this.state.bodyState)
        };

        if (this.props.onSave) {
            this.props.onSave(editorData);

        } else {

            const getMutationForSave = (
                this.props.getMutationForSave
                || this._getDefaultMutationForSave.bind(this)
            );

            this.props.relay.commitUpdate(
                getMutationForSave(editorData),
                {
                    onSuccess: this._redirectOnSuccess.bind(this)
                }
            );
        }
    }

    private _onSummaryChange(event) {
        this.setState({ summaryContent: event.target.value });
    }

    private _onBodyChange(bodyState) {
        this.setState({ bodyState });
    }

    private _setStateDelayed(state) {
        if (this._delayedStateTimer) {
            clearTimeout(this._delayedStateTimer);
        }

        this._delayedState = Object.assign({}, this._delayedState, state);

        this._delayedStateTimer = setTimeout(() => {
            this.setState(this._delayedState);
        }, 50);
    }

    private _shouldShowFullEditor(): boolean {
        return this.props.showFullEditor || (
            this._hasInteractedWithSignInUp ||
            this.state.bodyHasFocus ||
            this.state.summaryHasFocus ||
            this.state.summaryContent.length > 0 ||
            (this.state.bodyState && this.state.bodyState.getCurrentContent().hasText())
        );
    }

    private _getDefaultMutationForSave(editorData: IEditorData) {
        const {summary, bodyData} = editorData;

        return new CreateCommunityItemForTopicMutation({
            type: 'General',
            topic: this.props.topic,
            viewer: this.props.viewer,
            summary,
            bodyData
        });
    }

    private _redirectOnSuccess(response) {
        const redirectPath = (
            response
            && response.createCommunityItemFromTopic
            && response.createCommunityItemFromTopic.viewer
            && response.createCommunityItemFromTopic.viewer.lastCreatedCommunityItem
            && response.createCommunityItemFromTopic.viewer.lastCreatedCommunityItem.routePath
        );

        if (redirectPath) {
            this.props.router.push(redirectPath);
        }
    }

    private _recordSignInUpInteraction() {
        this._hasInteractedWithSignInUp = true;
    }
}

export var CreateItemEditor = Relay.createContainer(withRouter(CommunityItemEditor), {
    fragments: {
        viewer: () => Relay.QL`
            fragment on Viewer {
                ${CreateCommunityItemForTopicMutation.getFragment('viewer')}
                
                lastCreatedCommunityItem {
                    routePath
                }
            }
        `,

        topic: () => Relay.QL`
            fragment on Topic {
                id
                name
                ${CreateCommunityItemForTopicMutation.getFragment('topic')}
            }
        `
    }
});

export var UpdateItemEditor = Relay.createContainer(withRouter(CommunityItemEditor), {
    fragments: {
        review: () => Relay.QL`
            fragment on CommunityItemInterface {
                id,
                type,
                summary,
                body
            }
        `
    }
});
