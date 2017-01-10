import * as React from 'react';
import * as Relay from 'react-relay';

import CreateCommunityItemMutation from 'pz-client/src/community-item/create-community-item-mutation';
import CommunityItemBodyEditor from 'pz-client/src/community-item/community-item-body-editor.component';
import serializeEditorState from 'pz-client/src/editor/serialize-editor-state';
import classNames from 'classnames';
import {withRouter} from 'react-router';
import handleClick from 'pz-client/src/support/handle-click';

import {
    SignInUpContextType,
    ISignInUpContext
} from 'pz-client/src/user/sign-in-up-overlay-component';

import EditRating from 'pz-client/src/community-item/widgets/edit-rating-component';

import SignInUp from 'pz-client/src/user/sign-in-up-embedded-component';
import ReviewTopicSelector from 'pz-client/src/community-item/widgets/review-topic-selector-component';
import SummaryEditor from 'pz-client/src/community-item/widgets/summary-editor-component';
import GoogleTagManager from 'pz-client/src/support/google-tag-manager';

interface IProps {
    relay: any

    viewer: {
        id: any

        topic: {
            id: any
            serverId: number
            name: string
        }
    }

    topic?: {
        id: any
        name: string
        isCategory: boolean
    }

    fromTopic?: {
        id: any
    }

    router: {
        push: Function
    }

    className?: string

    autoFocus?: boolean
}

class ReviewCommunityItemEditor extends React.Component<IProps, any> {
    private _delayedStateTimer: any;
    private _delayedState = {};

    static contextTypes: any = {
        signInUpContext: SignInUpContextType
    };

    context: {
        signInUpContext: ISignInUpContext
    };

    state = {
        rating: null,
        summaryContent: '',
        bodyState: void(0),
        summaryHasFocus: false,
        bodyHasFocus: false,
        hasSelectedTopic: false,
        newTopicName: null
    };

    refs: {
        bodyEditor: any
    };

    private _hasInteractedWithSignInUp = false;

    render() {
        const classes = classNames('review-editor', this.props.className, {
            'editor-show-full-body': this._shouldShowFullBody(),
            'editor-hide-full-body': !this._shouldShowFullBody()
        });

        return (
            <div className={classes}>
                {this._renderTopicSelector()}
                {this._renderRating()}
                {this._renderBody()}
                {this._renderSubmit()}
            </div>
        );
    }

    componentWillUnmount() {
        if (this._delayedStateTimer) {
            clearTimeout(this._delayedStateTimer);
        }
    }

    private _getTopic(): {id: any, name: string} | null {
        return this.props.topic || (this.state.hasSelectedTopic && this.props.viewer.topic);
    }

    private _canChangeTopic() {
        return !this.props.topic;
    }

    private _hasSelectedTopic() {
        return this.props.topic || this.state.hasSelectedTopic;
    }

    private _renderTopicSelector() {
        if (this.props.topic) {
            return;
        }

        if (this._hasSelectedTopic()) {
            return;
        }

        return (
            <ReviewTopicSelector
                onTopicSelected={this._selectTopic.bind(this)}
                onNewTopicSelected={this._selectNewTopic.bind(this)}
                autoFocus={this.props.autoFocus}
            />
        );
    }

    private _renderRating() {
        const topic = this._getTopic();

        if (!this._hasSelectedTopic()) {
            return;
        }

        const topicName = topic ? topic.name : this.state.newTopicName;

        const clearTopicButton = this._canChangeTopic() && (
            <button
                className="clear-topic-button"
                onClick={this._clearSelectedTopic.bind(this)}
            />
        );

        return (
            <div className="editor-rating">
                <EditRating rating={this.state.rating} onChange={this._setRating.bind(this)} />

                <div className="editor-rating-label">
                    How would you rate <span className="selected-topic">{topicName}</span>?
                    {clearTopicButton}
                </div>
            </div>
        );
    }

    private _renderSubmit() {
        if (!this.state.rating) {
            return;
        }

        const postButton = (
            <button className="post-button"
                    onClick={handleClick(this._saveCommunityItem.bind(this))}>

                <i className="save-icon" />Post
            </button>
        );

        return this.context.signInUpContext.isLoggedIn()
            ? postButton
            : this._renderSignInUp();
    }

    private _renderSignInUp() {
        return (
            <SignInUp
                onInteraction={this._recordSignInUpInteraction.bind(this)}
                onSuccess={this._saveCommunityItem.bind(this)}
                submitText="Post"
            />
        );
    }

    private _renderSummary() {
        const classes = classNames('editor-summary', {
            'has-input': this.state.summaryContent && this.state.summaryContent.length
        });

        return (
            <SummaryEditor
                className={classes}
                placeholder="Write a summary for your review"
                onChange={this._onSummaryChange.bind(this) }
                onOverflow={this._addOverflowedSummaryToBody.bind(this)}
                onFocus={this._onSummaryFocus.bind(this) }
                onBlur={this._onSummaryBlur.bind(this) }
            />
        );
    }

    private _renderBody() {
        if (!this._hasSelectedTopic()) {
            return;
        }

        if (!this.state.rating) {
            return;
        }

        return (
            <CommunityItemBodyEditor
                ref="bodyEditor"
                placeholder="Elaborate here if you wish..."
                onChange={this._onBodyChange.bind(this) }
                onFocus={this._onBodyFocus.bind(this) }
                onBlur={this._onBodyBlur.bind(this) }
                headerContent={this._renderSummary()}
            />
        )
    }

    private _setRating(rating: number) {
        if (!this.state.rating) {
            GoogleTagManager.triggerSetReviewRating();
        }

        this.setState({rating});
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

    private _addOverflowedSummaryToBody(overflowedText: string) {
        setTimeout(() => {
            this.refs.bodyEditor.focus();
            this.refs.bodyEditor.prependText(overflowedText);
        }, 0);
    }

    private _saveCommunityItem() {
        const topic = this._getTopic();
        const newTopicName = this.state.newTopicName;

        if (!topic && !newTopicName) {
            throw new Error('No topic available');
        }

        GoogleTagManager.triggerReviewPost();

        let reviewDetails: any = {
            reviewRating: this.state.rating
        };

        if (topic) {
            reviewDetails.reviewedTopicId = topic.id;
        } else {
            reviewDetails.newReviewedTopic = newTopicName;
        }

        const additionalTopicIds = this.props.fromTopic ? [this.props.fromTopic.id] : [];

        const mutation = new CreateCommunityItemMutation({
            type: 'Review',
            viewer: this.props.viewer,
            summary: this.state.summaryContent,
            bodyData: serializeEditorState(this.state.bodyState),
            topicIds: additionalTopicIds,
            reviewDetails
        });

        this.props.relay.commitUpdate(mutation,
            {
                onSuccess: this._redirectOnSuccess.bind(this)
            }
        );
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
        return (
        this.state.bodyHasFocus ||
        this.state.summaryHasFocus ||
        this.state.summaryContent.length > 0 ||
        (this.state.bodyState && this.state.bodyState.getCurrentContent().hasText()));
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

    private _selectTopic(serverId: number) {
        this.setState({hasSelectedTopic: true, newTopicName: null});
        this.props.relay.setVariables({selectedTopicServerId: serverId});
    }

    private _selectNewTopic(topicName: string) {
        this.setState({hasSelectedTopic: true, newTopicName: topicName});
        this.props.relay.setVariables({selectedTopicServerId: null});
    }

    private _clearSelectedTopic() {
        this.setState({
            hasSelectedTopic: false,
            newTopicName: null,
            rating: null
        });

        this.props.relay.setVariables({selectedTopicServerId: null});
    }
}

export default Relay.createContainer(withRouter(ReviewCommunityItemEditor), {
    initialVariables: {
        selectedTopicServerId: null
    },

    fragments: {
        viewer: () => Relay.QL`
            fragment on Viewer {
                ${CreateCommunityItemMutation.getFragment('viewer')}
                
                lastCreatedCommunityItem {
                    routePath
                }
                
                topic(serverId: $selectedTopicServerId) {
                    id
                    serverId
                    name
                }
            }
        `,

        topic: () => Relay.QL`
            fragment on Topic {
                id
                name
            }
        `,

        fromTopic: () => Relay.QL`
            fragment on Topic {
                id
            }
        `
    }
});
