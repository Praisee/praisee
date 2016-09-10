import * as React from 'react';
import * as Relay from 'react-relay';
import {Component} from 'react';
import TopicWiki from 'pz-client/src/topic/side-section/topic-wiki.component';
import {ITopic} from 'pz-server/src/topics/topics';
import RelatedTopics from 'pz-client/src/topic/side-section/related-topics.component';

interface ISideSectionProps {
    topic: {
        name: string
        overviewContent: string

        attributes: Array<{
            attributeType: string
        }>
    };
}

class SideSection extends Component<ISideSectionProps, any> {
    render() {
        return (
            <div className="side-section">
                <h2>{this.props.topic.name}</h2>
                <TopicWiki overviewContent={this.props.topic.overviewContent} />

                {this._renderAttributes()}
            </div>
        );
    }

    private _renderAttributes() {
        return this.props.topic.attributes.map(
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
                name,
                overviewContent,
                
                attributes {
                    id,
                    attributeType,
                    ${RelatedTopics.getFragment('attribute')}
                }
            }
        `
    }
});
