import * as React from 'react';
import * as Relay from 'react-relay';
import {Link} from 'react-router';

export interface IProps {
    attribute: {
        topics: Array<{
            name

            thumbnailPhoto: null | {
                defaultUrl: string
                variations: {
                    initialLoad: string
                    mobile: string
                }
            }
        }>
    }
}

class RelatedTopics extends React.Component<IProps, any> {
    render() {
        return (
            <div className="related-topics">
                <h3 className="related-topics-heading">Related Topics</h3>

                <ul className="related-topics-list">
                    {this.props.attribute.topics.map(
                        topic => this._renderRelatedTopic(topic)
                    )}
                </ul>
            </div>
        );
    }

    private _renderRelatedTopic(topic) {
        return (
            <li key={topic.id} className="related-topic">
                <Link to={topic.routePath}>
                    <span className="related-topic-thumbnail-photo-container">
                        {this._renderTopicThumbnailPhoto(topic)}
                    </span>

                    <span className="related-topic-name">
                        {topic.name}
                    </span>
                </Link>
            </li>
        );
    }

    private _renderTopicThumbnailPhoto(topic) {
        if (!topic.thumbnailPhoto) {
            return (
                <span className="related-topic-thumbnail-photo-missing" />
            );
        }

        return (
            <img
                className="related-topic-thumbnail-photo"
                src={topic.thumbnailPhoto.defaultUrl}
                alt={topic.name}
            />
        );
    }
}

export default Relay.createContainer(RelatedTopics, {
    fragments: {
        attribute: () => Relay.QL`
            fragment on RelatedTopicsTopicAttribute {
                topics {
                    id,
                    name,
                    routePath,
                    thumbnailPhoto {
                        defaultUrl
                        variations {
                            initialLoad
                            mobile
                        }
                    }
                }
            }
        `
    }
});
