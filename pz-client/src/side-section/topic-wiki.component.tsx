import * as React from 'react';
import {Component} from 'react';
import {ITopicInstance} from 'pz-domain/src/models/topic';

interface ITopicWikiProps {
    topic: ITopicInstance;
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