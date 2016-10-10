import * as React from 'react';
import * as Relay from 'react-relay';

import CreateCommunityItemForTopicMutation from 'pz-client/src/community-item/create-community-item-from-topic-mutation';
import CommunityItemBodyEditor from 'pz-client/src/community-item/community-item-body-editor.component';
import serializeEditorState from 'pz-client/src/editor/serialize-editor-state';
import classNames from 'classnames';
import {withRouter} from 'react-router';

import {
    SignInUpContextType,
    ISignInUpContext
} from 'pz-client/src/user/sign-in-up-overlay-component';

import EditRating from 'pz-client/src/community-item/widgets/edit-rating-component';

interface IProps {
    relay: any

    viewer: {
        id: any
    }

    topic: {
        id: any
        name: string
    }

    router: {
        push: Function
    }
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
        isEditing: false,
        summaryHasFocus: false,
        bodyHasFocus: false
    };

    render() {
        return (
            <div className="review-editor">
                <form className="editor-form" onSubmit={this._saveCommunityItem.bind(this) }>
                    {this._renderRating()}
                    {this._renderEditorContainer()}
                    {this._renderSubmit()}
                </form>
            </div>
        );
    }

    componentWillUnmount() {
        if (this._delayedStateTimer) {
            clearTimeout(this._delayedStateTimer);
        }
    }

    private _renderRating() {
        return (
            <div className="editor-rating">
                <EditRating rating={this.state.rating} onChange={this._setRating.bind(this)} />

                <div className="editor-rating-label">
                    How would you rate {this.props.topic.name}?
                </div>
            </div>
        );
    }

    private _renderEditorContainer() {
        if (!this.state.rating) {
            return;
        }

        return (
            <div className="editor-container">
                {this._renderSummary()}
                {this._renderBody()}
            </div>
        );
    }

    private _renderSubmit() {
        if (!this.state.rating) {
            return;
        }

        return (
            <button className="submit">
                <i className="save" />Post
            </button>
        );
    }

    private _renderSummary() {
        const classes = classNames('editor-summary', {
            'has-input': this.state.summaryContent && this.state.summaryContent.length
        });

        return (
            <input
                className={classes}
                type="text"
                placeholder="Write a summary for your review"
                onChange={this._onSummaryChange.bind(this) }
                onFocus={this._onSummaryFocus.bind(this) }
                onBlur={this._onSummaryBlur.bind(this) }
            />
        );
    }

    private _renderBody() {
        if (!this._isEditing()) {
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
            </div>
        )
    }

    private _setRating(rating: number) {
        if (!this.context.signInUpContext.isLoggedIn) {
            this.context.signInUpContext.showSignInUp();
            return;
        }

        this.setState({rating});
    }

    private _onSummaryFocus() {
        if (!this.context.signInUpContext.isLoggedIn) {
            this.context.signInUpContext.showSignInUp();
            return;
        }

        this._setStateDelayed({ summaryHasFocus: true });
    }

    private _onBodyFocus() {
        if (!this.context.signInUpContext.isLoggedIn) {
            this.context.signInUpContext.showSignInUp();
            return;
        }
        this._setStateDelayed({ bodyHasFocus: true });
    }

    private _onSummaryBlur() {
        this._setStateDelayed({ summaryHasFocus: false });
    }

    private _onBodyBlur() {
        this._setStateDelayed({ bodyHasFocus: false });
    }

    private _saveCommunityItem(event) {
        event.preventDefault();

        const mutation = new CreateCommunityItemForTopicMutation({
            type: 'Review',
            viewer: this.props.viewer,
            topic: this.props.topic,
            summary: this.state.summaryContent,
            bodyData: serializeEditorState(this.state.bodyState),
            reviewDetails: {
                reviewedTopicId: this.props.topic.id,
                reviewRating: this.state.rating
            }
        });

        this.props.relay.commitUpdate(mutation,
            {
                onSuccess: this._redirectOnSuccess.bind(this)
            }
        );
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

    private _isEditing(): boolean {
        return (
        this.state.bodyHasFocus ||
        this.state.summaryHasFocus ||
        this.state.summaryContent.length > 0 ||
        (this.state.bodyState && this.state.bodyState.getCurrentContent().hasText()));
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
}

export default Relay.createContainer(withRouter(ReviewCommunityItemEditor), {
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
