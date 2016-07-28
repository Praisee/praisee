import * as React from 'react';
import {Component} from 'react';
import {ITopic} from 'pz-server/src/topics/topics';

interface ITopicWikiProps {
    topic: ITopic;
}

interface ITopicWikiState {
}

export default class TopicWiki extends Component<ITopicWikiProps, ITopicWikiState>{
    constructor(props, context) {
        super(props, context);

        this.state = {
        };
    }

    render() {
        return (
            <p>
                {this.props.topic.overviewContent}
            </p>
        )
    }
}
