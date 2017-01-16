import * as React from 'react';
import * as Relay from 'react-relay';

import { ISignInUpContext, SignInUpContextType } from 'pz-client/src/user/sign-in-up-overlay-component';
import CreateCommunityItemMutation from 'pz-client/src/community-item/create-community-item-mutation';
import CommunityItemBodyEditor from 'pz-client/src/community-item/community-item-body-editor.component';
import serializeEditorState from 'pz-client/src/editor/serialize-editor-state';
import classNames from 'classnames';
import { withRouter } from 'react-router';
import SignInUp from 'pz-client/src/user/sign-in-up-embedded-component';
import handleClick from 'pz-client/src/support/handle-click';
import SummaryEditor from 'pz-client/src/community-item/widgets/summary-editor-component';
import GoogleTagManager from 'pz-client/src/support/google-tag-manager';

import {
    createPersistedDataComponent,
    createMemoryLoaders
} from 'pz-client/src/support/create-persisted-data-component';

export interface IEditorData {
    summary: string
    bodyData: any
}

export interface IProps {
    persistedDataKey: any

    viewer: {
        lastCreatedCommunityItem: {
            routePath
        }
    }

    topic?: {
        id: number,
        name: string
    }

    summaryPlaceholder?: string

    showFullEditor?: boolean
    alwaysShowSubmitButton?: boolean

    onSave?: (editorData: IEditorData) => any
    getMutationForSave?: (editorData: IEditorData) => any
    onMutationSaved?: (response: any) => any

    className?: string

    relay: any

    router: {
        push: Function
    }

    persistedData?: {
        initialSummary: string,
        initialBody: any,
    }
}

class CommunityItemEditor extends React.Component<IProps, any> {
    render() {
        const classes = classNames('community-item-editor', this.props.className, {
            'editor-show-full-body': this._shouldShowFullBody(),
            'editor-hide-full-body': !this._shouldShowFullBody()
        });

        return (
            <div className={classes}>
                {this._renderBody()}
                {this._renderSignInUp()}
                {this.props.alwaysShowSubmitButton && this._renderSubmit()}
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

    refs: {
        bodyEditor: any
    };

    private _saying = void (0);

    private _hasInteractedWithSignInUp = false;

    constructor(props, state) {
        super(props, state);

        const {initialSummary = null} = props.persistedData || {};

        this.state = {
            summaryContent: initialSummary || '',
            bodyState: void(0),
            summaryHasFocus: false,
            bodyHasFocus: false
        };
    }

    componentWillUnmount() {
        if (this._delayedStateTimer) {
            clearTimeout(this._delayedStateTimer);
        }
    }

    private _renderSummary() {
        const classes = classNames('editor-summary', {
            'has-input': this.state.summaryContent && this.state.summaryContent.length
        });

        const {initialSummary = void(0)} = this.props.persistedData || {};

        return (
            <SummaryEditor
                className={classes}
                initialValue={initialSummary}
                placeholder={this._getSummaryPlaceholder()}
                onChange={this._onSummaryChange.bind(this)}
                onOverflow={this._addOverflowedSummaryToBody.bind(this)}
                onFocus={this._onSummaryFocus.bind(this)}
                onBlur={this._onSummaryBlur.bind(this)}
            />
        );
    }

    private _renderBody() {
        const inlineSubmit = !this.props.alwaysShowSubmitButton ?
            this._renderSubmit() : null;

        const {initialBody = void(0)} = this.props.persistedData || {};

        return (
            <div>
                <CommunityItemBodyEditor
                    ref="bodyEditor"
                    initialRawContentState={initialBody}
                    placeholder="Elaborate here if you wish..."
                    onChange={this._onBodyChange.bind(this)}
                    onFocus={this._onBodyFocus.bind(this)}
                    onBlur={this._onBodyBlur.bind(this)}
                    headerContent={this._renderSummary()}
                    footerContent={inlineSubmit}
                />
            </div>
        )
    }

    private _renderSubmit() {
        if (!this.context.signInUpContext.isLoggedIn()) {
            return;
        }

        return (
            <button className="post-button"
                onClick={handleClick(this._saveCommunityItem.bind(this))}>

                <i className="save-icon" />Post
            </button>
        );
    }

    private _renderSignInUp() {
        if (!this._shouldShowFullBody() || this.context.signInUpContext.isLoggedIn()) {
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
            `Add something to %s...`,
            `What do you think about %s?`,
            `Share your thoughts on %s...`,
            `Share something about %s...`
        ];

        var randomSaying = sayings[Math.floor(Math.random() * (sayings.length - 1))];

        this._saying = randomSaying.replace('%s', this.props.topic.name);
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
                    onSuccess: (response) => {
                        this.state = {
                            summaryContent: '',
                            bodyState: void(0),
                            summaryHasFocus: false,
                            bodyHasFocus: false
                        };

                        if (this.props.onMutationSaved) {
                            this.props.onMutationSaved(response);
                        }

                        this._redirectOnSuccess(response)
                    }
                }
            );
        }
    }

    private _onSummaryChange(value) {
        this.setState({ summaryContent: value });
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

    private _shouldShowFullBody(): boolean {
        return this.props.showFullEditor || (
            this._hasInteractedWithSignInUp ||
            this.state.bodyHasFocus ||
            this.state.summaryHasFocus ||
            this.state.summaryContent.length > 0 ||
            (this.state.bodyState && this.state.bodyState.getCurrentContent().hasText())
        );
    }

    private _getDefaultMutationForSave(editorData: IEditorData) {
        GoogleTagManager.triggerGeneralPost();

        const {summary, bodyData} = editorData;

        return new CreateCommunityItemMutation({
            type: 'General',
            topicIds: [this.props.topic.id],
            viewer: this.props.viewer,
            summary,
            bodyData
        });
    }

    private _redirectOnSuccess(response) {
        const redirectPath = (
            response
            && response.createCommunityItem
            && response.createCommunityItem.viewer
            && response.createCommunityItem.viewer.lastCreatedCommunityItem
            && response.createCommunityItem.viewer.lastCreatedCommunityItem.routePath
        );

        if (redirectPath) {
            this.props.router.push(redirectPath);
        }
    }

    private _recordSignInUpInteraction() {
        this._hasInteractedWithSignInUp = true;
    }

    private _addOverflowedSummaryToBody(overflowedText: string) {
        setTimeout(() => {
            this.refs.bodyEditor.focus();
            this.refs.bodyEditor.prependText(overflowedText);
        }, 0);
    }
}

const [persister, reloader] = createMemoryLoaders(
    (element: any) => ({
        initialSummary: element.state.summaryContent,
        initialBody: element.state.bodyState ?
            serializeEditorState(element.state.bodyState)
            : void(0)
    })
);

const PersistableCommunityItemEditor = createPersistedDataComponent(
    CommunityItemEditor,
    persister,
    reloader
);

export var CreateItemEditor = Relay.createContainer(withRouter(PersistableCommunityItemEditor), {
    fragments: {
        viewer: () => Relay.QL`
            fragment on Viewer {
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
            }
        `
    }
});

export default CreateItemEditor;
