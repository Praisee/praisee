import * as React from 'react';
import {Component} from 'react';

interface ITopicWikiProps {
    overviewContent: string;
}

export default class TopicWiki extends Component<ITopicWikiProps, any>{
    render() {
        return (
            <div className="topic-overview">
                {this.props.overviewContent}
            </div>
        )
    }
}
