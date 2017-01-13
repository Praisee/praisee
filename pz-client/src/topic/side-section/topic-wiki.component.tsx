import * as React from 'react';
import {Component} from 'react';
import ContentTruncator from 'pz-client/src/widgets/content-truncator-component';

interface ITopicWikiProps {
    overviewContent: string;
}

export default class TopicWiki extends Component<ITopicWikiProps, any>{
    render() {
        return (
            <div className="topic-overview">
                <ContentTruncator truncateToHeight={150} heightMargin={50}>
                    {this.props.overviewContent}
                </ContentTruncator>
            </div>
        )
    }
}
