import * as React from 'react';
import * as Relay from 'react-relay';

import CurrentUserType from 'pz-client/src/user/current-user-type';
import SignInUpOverlay, { ISignInUpContext, SignInUpContextType } from 'pz-client/src/user/sign-in-up-overlay-component';
import CreateCommunityItemMutation from 'pz-client/src/community-item/create-community-item-mutation';
import CommunityItemBodyEditor from 'pz-client/src/community-item/community-item-body-editor.component';
import serializeEditorState from 'pz-client/src/editor/serialize-editor-state';
import classNames from 'classnames';
import { withRouter } from 'react-router';
import SignInUp from 'pz-client/src/user/sign-in-up-embedded-component';
import handleClick from 'pz-client/src/support/handle-click';
import SummaryEditor from 'pz-client/src/community-item/widgets/summary-editor-component';
import GoogleTagManager from 'pz-client/src/support/google-tag-manager';

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
            'editor-show-full-body': this._shouldShowFullBody(),
            'editor-hide-full-body': !this._shouldShowFullBody()
        });

        return (
            <div className={classes}>
                {this._renderBody()}
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
        bodyState: void (0),
        summaryHasFocus: false,
        bodyHasFocus: false,
        showSignInUp: true
    };

    refs: {
        bodyEditor: any
    };

    private _saying = void (0);

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
            <SummaryEditor
                className={classes}
                placeholder={this._getSummaryPlaceholder()}
                onChange={this._onSummaryChange.bind(this)}
                onOverflow={this._addOverflowedSummaryToBody.bind(this)}
                onFocus={this._onSummaryFocus.bind(this)}
                onBlur={this._onSummaryBlur.bind(this)}
                />
        );
    }

    private _renderBody() {
        return (
            <div>
                <CommunityItemBodyEditor
                    ref="bodyEditor"
                    placeholder="Elaborate here if you wish..."
                    onChange={this._onBodyChange.bind(this)}
                    onFocus={this._onBodyFocus.bind(this)}
                    onBlur={this._onBodyBlur.bind(this)}
                    headerContent={this._renderSummary()}
                    footerContent={this._renderPostButton()}
                    />
            </div>
        )
    }

    private _renderPostButton() {
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
        if (this.state.showSignInUp !== !this.context.signInUpContext.isLoggedIn())
            this.setState({ showSignInUp: !this.context.signInUpContext.isLoggedIn() });

        if (!this.state.showSignInUp)
            return;

        if (!this._shouldShowFullBody() || this.context.signInUpContext.isLoggedIn()) {
            return;
        }

        if (typeof (window) !== 'undefined') {
            window['showSignInUp'] = this._setShowSignInUp.bind(this);
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
                    onSuccess: this._redirectOnSuccess.bind(this)
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

    private _setShowSignInUp(showSignInUp: boolean) {
        this.setState({ showSignInUp })
    }
}

export var CreateItemEditor = Relay.createContainer(withRouter(CommunityItemEditor), {
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
