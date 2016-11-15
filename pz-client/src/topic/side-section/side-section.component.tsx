import * as React from 'react';
import * as Relay from 'react-relay';
import {Component} from 'react';
import TopicActions from 'pz-client/src/topic/side-section/topic-actions.component';
import TopicWiki from 'pz-client/src/topic/side-section/topic-wiki.component';
import RelatedTopics from 'pz-client/src/topic/side-section/related-topics.component';
import AdminControls from 'pz-client/src/topic/side-section/admin-controls.component';
import PhotoGallery from 'pz-client/src/topic/side-section/photo-gallery-component';
import {ITopicActions} from 'pz-client/src/topic/topic.controller';

interface ISideSectionProps {
    topic: {
        name: string
        overviewContent: string

        thumbnailPhoto: null | {
            defaultUrl: string
            variations: {
                initialLoad: string
                mobile: string
            }
        }

        attributes: Array<{
            attributeType: string
        }>
    };

    topicActions: ITopicActions
    topicReviewActionActive?: boolean
    topicQuestionActionActive?: boolean
    
    hideSideContent: Function
}

class SideSection extends Component<ISideSectionProps, any> {
    render() {
        const topic = this.props.topic;

        return (
            <div className="side-section">
                <h2 className="side-section-title">{topic.name}</h2>

                <div className="side-section-block">
                    <TopicActions
                        topic={topic}
                        topicActions={this.props.topicActions}
                        topicReviewActionActive={this.props.topicReviewActionActive}
                        topicQuestionActionActive={this.props.topicQuestionActionActive}
                        hideSideContent={this.props.hideSideContent}
                    />
                </div>

                <div className="side-section-block">
                    {this._renderTopicPhoto(topic)}
                </div>

                <div className="side-section-block">
                    <TopicWiki overviewContent={topic.overviewContent} />
                </div>

                <div className="side-section-block">
                    {this._renderGallery(topic)}
                </div>

                <div className="side-section-block">
                    {this._renderAttributes(topic.attributes)}
                </div>

                <div className="side-section-block">
                    <AdminControls topic={topic} />
                </div>
            </div>
        );
    }

    state = {
        hasMounted: false
    };

    componentDidMount() {
        this.setState({hasMounted: true});
    }

    private _renderTopicPhoto(topic) {
        if (!topic.thumbnailPhoto) {
            return;
        }

        return (
            <img
                className="topic-thumbnail-photo"
                src={topic.thumbnailPhoto.defaultUrl}
                alt={topic.name}
            />
        );
    }

    private _renderGallery(topic) {
        if (!this.state.hasMounted) {
            return;
        }

        return (
            <PhotoGallery topic={topic} />
        );
    }

    private _renderAttributes(attributes) {
        return attributes.map(
            attribute => this._renderAttribute(attribute)
        );
    }

    private _renderAttribute(attribute) {
        switch(attribute.attributeType) {
            case 'RelatedTopics':
                return (
                    <RelatedTopics key={attribute.id} attribute={attribute} />
                );
        }
    }
}

export default Relay.createContainer(SideSection, {
    fragments: {
        topic: () => Relay.QL`
            fragment on Topic {
                name
                overviewContent
                thumbnailPhoto {
                    defaultUrl
                    variations {
                        initialLoad
                        mobile
                    }
                }
                
                ${TopicActions.getFragment('topic')}
                
                ${PhotoGallery.getFragment('topic')}
                
                ${AdminControls.getFragment('topic')}
                
                attributes {
                    id
                    attributeType
                    ${RelatedTopics.getFragment('attribute')}
                }
            }
        `
    }
});
