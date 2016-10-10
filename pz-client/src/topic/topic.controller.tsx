import * as React from 'react';
import {Component} from 'react';
import * as Relay from 'react-relay';
import * as util from 'util';
import {CreateItemEditor} from 'pz-client/src/community-item/community-item-editor.component';
import ReviewEditor from 'pz-client/src/community-item/review-editor-component';
// import QuestionEditor from 'pz-client/src/community-item/question-editor-component';
import SideSection from 'pz-client/src/topic/side-section/side-section.component';
import {ITopic} from 'pz-server/src/topics/topics';
import SchemaInjector, {ISchemaType} from 'pz-client/src/support/schema-injector';
import CommunityItem from 'pz-client/src/community-item/community-item-component';
import ExpandButton from 'pz-client/src/widgets/expand-button-component'

import {
    notFoundContext,
    INotFoundContext
} from 'pz-client/src/app/not-found-context';
import QuestionEditor from '../community-item/question-editor-component';

interface IContext extends INotFoundContext {
    showNotFoundError: any
}

export interface ITopicActions {
    toggleTopicReviewEditor: () => any
    toggleTopicQuestionEditor: () => any
}

export class TopicController extends Component<ITopicProps, ITopicState> {
    render() {
        if (!this.props.topic) {
            this.context.showNotFoundError();
            return <span />;
        }

        return (
            <div className="topic-namespace" >
                {this._renderPrimarySection() }
                {this._renderSideSection() }
            </div>
        )
    }

    static contextTypes = Object.assign({}, notFoundContext);

    context: IContext;

    state = {
        isShowingReviewEditor: false,
        isShowingQuestionEditor: false
    };

    componentWillReceiveProps(nextProps) {
        const topicIsNotAvailable = !this.props.topic || !nextProps.topic;
        const topicHasChanged = !topicIsNotAvailable && (
            this.props.topic.id !== nextProps.topic.id
        );

        if (topicIsNotAvailable || topicHasChanged) {
            this.setState({
                isShowingReviewEditor: false,
                isShowingQuestionEditor: false
            })
        }
    }

    _renderPrimarySection() {
        return (
            <div className="primary-section" >
                {this._renderContributionSection() }
                {this._renderTopicContentSection() }
            </div>
        )
    }

    _renderContributionSection() {
        if (this.state.isShowingReviewEditor) {
            return (
                <ReviewEditor topic={this.props.topic} />
            );

        } else if (this.state.isShowingQuestionEditor) {
            return (
                <QuestionEditor topic={this.props.topic} />
            );

        } else {

            return (
                <CreateItemEditor topic={this.props.topic} />
            );
        }
    }

    _renderTopicContentSection() {
        if (this.props.topic.communityItems.edges.length > 0) {
            return this._renderTopicContent();
        }
        else {
            return this._renderEmptyContent();
        }
    }

    _renderTopicContent() {
        const rows = this.props.topic.communityItems.edges
            .map(({node}) =>
                <CommunityItem key={node.id} communityItem={node} truncateLongContent={true} />
            );

        let expandButton = null;
        if (this.props.topic.communityItemCount > this.props.relay.variables.limit) {
            expandButton = (
                <ExpandButton
                    className="show-more-community-items"
                    onExpand={this._showMoreCommunityItems.bind(this)}
                />
            )
        }

        return (
            <div>
                {rows}
                {expandButton}
            </div>
        );
    }

    _renderEmptyContent() {
        return (
            <div>
                <span>Be the first to review, ask a question, or talk about {this.props.topic.name}</span>
            </div>
        ); //change to list of questions
    }

    _renderSideSection() {
        return (
            <div className="side-section-container">
                <SideSection
                    topic={this.props.topic}
                    topicActions={this._getTopicActions()}
                    topicReviewActionActive={this.state.isShowingReviewEditor}
                    topicQuestionActionActive={this.state.isShowingQuestionEditor}
                />
            </div>
        )
    }

    _getTopicActions(): ITopicActions {
        return {
            toggleTopicReviewEditor: () => {
                if (this.state.isShowingReviewEditor) {
                    this.setState({isShowingReviewEditor: false});
                } else {
                    this.setState({
                        isShowingReviewEditor: true,
                        isShowingQuestionEditor: false
                    });
                }
            },

            toggleTopicQuestionEditor: () => {
                if (this.state.isShowingQuestionEditor) {
                    this.setState({isShowingQuestionEditor: false});
                } else {
                    this.setState({
                        isShowingQuestionEditor: true,
                        isShowingReviewEditor: false
                    });
                }
            }
        };
    }

    _addContribution() {
        console.log("submited");
        var num = Math.random();
        return num > .5 ? Promise.resolve(true) : Promise.resolve(false);
    }

    _showMoreCommunityItems() {
        this.props.relay.setVariables({ limit: this.props.relay.variables.limit + 5 })
    }
}

export default Relay.createContainer(TopicController, {
    initialVariables: {
        limit: 5
    },
    fragments: {
        topic: () => Relay.QL`
            fragment on Topic {
                id
                name                
                communityItemCount
                communityItems(first: $limit) {
                     edges{
                        node{
                            id,
                            ${CommunityItem.getFragment('communityItem')}
                        }
                    }
                },
                
                ${SideSection.getFragment('topic')}
                ${CreateItemEditor.getFragment('topic')}
                ${ReviewEditor.getFragment('topic')}
                ${QuestionEditor.getFragment('topic')}
            }
        `
    }
});

interface ITopicState {
}

interface ITopicProps {
    params;
    topic?: {
        id
        name
        communityItemCount
        communityItems
    };
    relay;
}
