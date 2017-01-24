import * as React from 'react';
import {Component} from 'react';
import * as Relay from 'react-relay';
import * as util from 'util';
import CommunityItemEditor from 'pz-client/src/community-item/community-item-editor.component';
import ReviewEditor from 'pz-client/src/community-item/review-editor-component';
// import QuestionEditor from 'pz-client/src/community-item/question-editor-component';
import SideSection from 'pz-client/src/topic/side-section/side-section.component';
import {ITopic} from 'pz-server/src/topics/topics';
import SchemaInjector, {ISchemaType} from 'pz-client/src/support/schema-injector';
import CommunityItem from 'pz-client/src/community-item/community-item-component';
import ExpandButton from 'pz-client/src/widgets/expand-button-component'
import classNames from 'classnames';

import {
    notFoundContext,
    INotFoundContext
} from 'pz-client/src/app/not-found-context';
import QuestionEditor from 'pz-client/src/community-item/question-editor-component';
import Helmet from 'react-helmet';

interface IContext extends INotFoundContext {
    showNotFoundError: any
}

export interface ITopicActions {
    toggleTopicGeneralEditor: () => any
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
                {this._renderPageHead()}
                {this._renderOffCanvasContainer()}
            </div>
        )
    }

    static contextTypes = Object.assign({}, notFoundContext);

    context: IContext;

    state = {
        isShowingGeneralEditor: false,
        isShowingQuestionEditor: false,
        isSideBarActive: false
    };

    componentWillReceiveProps(nextProps) {
        const topicIsNotAvailable = !this.props.topic || !nextProps.topic;
        const topicHasChanged = !topicIsNotAvailable && (
            this.props.topic.id !== nextProps.topic.id
        );

        if (topicIsNotAvailable || topicHasChanged) {
            this.setState({
                isShowingGeneralEditor: false,
                isShowingQuestionEditor: false,
                isSideBarActive: false
            })
        }
    }

    private _renderPageHead() {
        const topicName = this.props.topic.name;
        const title = `${topicName} Reviews, Questions, Answers and Discussion`;
        const description = this.props.topic.overviewContent || '';

        const photoFromGalleryEdge = this.props.topic.photoGallery.edges[0];
        const photoFromGallery = photoFromGalleryEdge && photoFromGalleryEdge.node.defaultUrl;
        const thumbnailPhoto = this.props.topic.thumbnailPhoto && this.props.topic.thumbnailPhoto.defaultUrl;
        const imageUrl = thumbnailPhoto || photoFromGallery || '';

        return (
            <Helmet
                title={title}

                meta={[
                    {name: 'description', content: description},

                    // Schema.org markup for Google
                    {itemprop: 'name', content: title},
                    {itemprop: 'description', content: description},
                    {itemprop: 'image', content: imageUrl},

                    // Open Graph Data
                    {property: 'og:title', content: title},
                    {property: 'og:type', content: 'article'},
                    {property: 'og:image', content: imageUrl},
                    {property: 'og:description', content: description},

                    // Twitter markup
                    {property: 'twitter:title', content: title},
                    {property: 'twitter:description', content: description},
                    {property: 'twitter:image:src', content: imageUrl},
                ]}
            />
        );
    }

    private _renderPrimarySection() {
        return (
            <div className="primary-section" >
                {this._renderContributionSection()}
                {this._renderTopicContentSection()}
            </div>
        )
    }

    private _renderContributionSection() {
        if (this.state.isShowingGeneralEditor) {
            return (
                <CommunityItemEditor
                    persistedDataKey={this.props.topic.id}
                    topic={this.props.topic}
                    viewer={this.props.viewer}
                />
            );

        } else if (this.state.isShowingQuestionEditor) {
            return (
                <QuestionEditor
                    persistedDataKey={this.props.topic.id}
                    topic={this.props.topic}
                    viewer={this.props.viewer}
                />
            );

        } else {

            if (this.props.topic.isCategory) {
                return (
                    <ReviewEditor
                        key={this.props.topic.id}
                        persistedDataKey={this.props.topic.id}
                        topic={null}
                        fromTopic={this.props.topic}
                        viewer={this.props.viewer}
                    />
                );

            } else {
                return (
                    <ReviewEditor
                        key={this.props.topic.id}
                        persistedDataKey={this.props.topic.id}
                        topic={this.props.topic}
                        fromTopic={this.props.topic}
                        viewer={this.props.viewer}
                    />
                );
            }
        }
    }

    private _renderTopicContentSection() {
        if (this.props.topic.communityItems.edges.length > 0) {
            return this._renderTopicContent();
        }
        else {
            return this._renderEmptyContent();
        }
    }

    private _renderTopicContent() {
        const rows = this.props.topic.communityItems.edges
            .map(({node}) =>
                <CommunityItem
                    key={node.id}
                    communityItem={node}
                    truncateLongContent={true}
                    linkShouldOpenInTab={true}
                />
            );

        let expandButton = null;
        const canExpand = this.props.topic.communityItemCount > this.props.relay.variables.limit;
        if (canExpand) {
            expandButton = (
                <ExpandButton
                    className="show-more-community-items"
                    onExpand={this._showMoreCommunityItems.bind(this)}
                    isExpanded={!canExpand}
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

    private _renderEmptyContent() {
        return (
            <div>
                <span>Be the first to review, ask a question, or talk about {this.props.topic.name}</span>
            </div>
        ); //change to list of questions
    }

    private _renderSideSection() {
        return (
            <div className="side-section-container off-canvas-content">
                <SideSection
                    topic={this.props.topic}
                    topicActions={this._getTopicActions()}
                    topicGeneralActionActive={this.state.isShowingGeneralEditor}
                    topicQuestionActionActive={this.state.isShowingQuestionEditor}
                    hideSideContent={this._hideSideContent.bind(this)}
                    />
            </div>
        )
    }

    private _getTopicActions(): ITopicActions {
        return {
            toggleTopicGeneralEditor: () => {
                if (this.state.isShowingGeneralEditor) {
                    this.setState({isShowingGeneralEditor: false});
                } else {
                    this.setState({
                        isShowingGeneralEditor: true,
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
                        isShowingGeneralEditor: false
                    });
                }
            }
        };
    }

    private _showMoreCommunityItems() {
        this.props.relay.setVariables({ limit: this.props.relay.variables.limit + 5 })
    }

    private _toggleOffCanvasContainer() {
        this.setState({ isSideBarActive: !this.state.isSideBarActive });
    }

    private _hideSideContent() {
        this.setState({isSideBarActive: false});
    }

    private _renderOffCanvasContainer() {
        var containerClasses = classNames("off-canvas-container", { "off-canvas-container-active": this.state.isSideBarActive });

        return (
            <div className="off-canvas-wrapper" >
                <div className={containerClasses} >
                    <h1 className="off-canvas-toggle-header"
                        onClick={this._toggleOffCanvasContainer.bind(this)}>
                        <span className="off-canvas-toggle-header-text">
                            {this.props.topic.name}
                        </span>
                        <i className="off-canvas-container-toggle-icon" />
                    </h1>

                    <div className="primary-section-overlay"
                        onClick={this._toggleOffCanvasContainer.bind(this)}>
                    </div>

                    {this._renderPrimarySection()}
                    {this._renderSideSection()}
                </div>
            </div>
        )
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
                isCategory
                overviewContent
                
                communityItemCount
                
                communityItems(first: $limit) {
                     edges {
                        node{
                            id,
                            ${CommunityItem.getFragment('communityItem')}
                        }
                    }
                }
                
                thumbnailPhoto {
                    defaultUrl
                }
                
                photoGallery(first: 1) {
                    edges {
                        node {
                            defaultUrl
                        }
                    }
                }
                
                ${SideSection.getFragment('topic')}
                ${CommunityItemEditor.getFragment('topic')}
                ${ReviewEditor.getFragment('topic')}
                ${ReviewEditor.getFragment('fromTopic')}
                ${QuestionEditor.getFragment('topic')}
            }
        `,

        viewer: () => Relay.QL`
            fragment on Viewer {
                ${CommunityItemEditor.getFragment('viewer')}
                ${ReviewEditor.getFragment('viewer')}
                ${QuestionEditor.getFragment('viewer')}
            }
        `
    }
});

interface ITopicState {
    isShowingGeneralEditor?: boolean,
    isShowingQuestionEditor?: boolean,
    isSideBarActive?: boolean;
}

interface ITopicProps {
    params

    topic?: {
        id
        name
        communityItemCount
        communityItems
        isCategory
        overviewContent

        thumbnailPhoto: {
            defaultUrl: string
        }

        photoGallery: {
            edges: [{
                node: {
                    defaultUrl
                }
            }]
        }
    }

    viewer
    relay
}
