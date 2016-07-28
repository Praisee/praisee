import * as React from 'react';
import {Component} from 'react';
import TopicWiki from 'pz-client/src/side-section/topic-wiki.component';
import {ITopic} from 'pz-server/src/topics/topics';

interface ISideSectionState {

}

interface ISideSectionProps {
    topic: ITopic;
}

export default class SideSection extends Component<ISideSectionProps, ISideSectionState> {
    constructor(props, context) {
        super(props, context);

        this.state = {

        };
    }

    render() {
        return (
            <div className="side-section">
                <h2>{this.props.topic.name}</h2>
                <TopicWiki topic={this.props.topic} />
            </div>
        );
    }
}
