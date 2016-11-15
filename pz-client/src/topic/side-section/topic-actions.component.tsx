import * as React from 'react';
import * as Relay from 'react-relay';
import classNames from 'classnames';

import handleClick from 'pz-client/src/support/handle-click';
import {ITopicActions} from 'pz-client/src/topic/topic.controller';

interface IProps {
    topic: {
        name: string
        isCategory: boolean
    }

    topicActions: ITopicActions

    topicReviewActionActive?: boolean
    topicQuestionActionActive?: boolean

    hideSideContent: Function
}

class TopicActions extends React.Component<IProps, any>{
    render() {
        return (
            <div className="topic-actions">
                {this._renderReviewAction()}
                {this._renderQuestionAction()}
            </div>
        )
    }

    private _renderReviewAction() {
        const label = this.props.topic.isCategory ?
            'Add a review' : `Review ${this.props.topic.name}`;

        return this._renderAction(
            label,
            'topic-actions-review-action',
            this.props.topicActions.toggleTopicReviewEditor,
            this.props.topicReviewActionActive
        );
    }

    private _renderQuestionAction() {
        const label = this.props.topic.isCategory ?
            'Ask a question' : `Ask a question about ${this.props.topic.name}`;

        return this._renderAction(
            label,
            'topic-actions-question-action',
            this.props.topicActions.toggleTopicQuestionEditor,
            this.props.topicQuestionActionActive
        );
    }

    private _renderAction(label, className, actionHandler, isActive) {
        const classes = classNames('topic-actions-action', className, {
            'topic-actions-active': isActive
        });

        return (
            <button className={classes}
                    onClick={ () => this._hideSideContentAndPerformAction(actionHandler)}>

                {label}
            </button>
        );
    }

    private _hideSideContentAndPerformAction(actionHandler) {
        this.props.hideSideContent();
        actionHandler();
    }
}

export default Relay.createContainer(TopicActions, {
    fragments: {
        topic: () => Relay.QL`
            fragment on Topic {
                name
                isCategory
            }
        `
    }
});
