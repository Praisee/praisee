import * as React from 'react';
import * as Relay from 'react-relay';
import {Link} from 'react-router';

export interface IProps {
    attribute: {
        topics: Array<{
            name
        }>
    }
}

class RelatedTopics extends React.Component<IProps, any> {
    render() {
        return (
            <div className="related-topics">
                <h3>Related Topics</h3>

                <ul>
                    {this.props.attribute.topics.map(
                        topic => this._renderRelatedTopic(topic)
                    )}
                </ul>
            </div>
        );
    }

    private _renderRelatedTopic(topic) {
        return (
            <li key={topic.id}>
                <Link to={topic.routePath}>{topic.name}</Link>
            </li>
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
                    routePath
                }
            }
        `
    }
});
