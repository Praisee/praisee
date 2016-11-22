import * as React from 'react';
import classNames from 'classnames';

import handleClick from 'pz-client/src/support/handle-click';
import {ITopicActions} from 'pz-client/src/topic/topic.controller';

interface IProps {
    topicName: string
    topicActions: ITopicActions

    topicReviewActionActive?: boolean
    topicQuestionActionActive?: boolean

    hideSideContent: Function
}

export default class TopicActions extends React.Component<IProps, any>{
    render() {
        return (
            <div className="topic-actions">
                {this._renderAction(
                    `Review ${this.props.topicName}`,
                    'topic-actions-review-action',
                    this.props.topicActions.toggleTopicReviewEditor,
                    this.props.topicReviewActionActive
                )}

                {this._renderAction(
                    `Ask a question about ${this.props.topicName}`,
                    'topic-actions-question-action',
                    this.props.topicActions.toggleTopicQuestionEditor,
                    this.props.topicQuestionActionActive
                )}
            </div>
        )
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

    private _hideSideContentAndPerformAction(actionHandler){
        this.props.hideSideContent();
        actionHandler();
    }
}