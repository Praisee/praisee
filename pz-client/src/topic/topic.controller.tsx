import * as React from 'react';
import {Component} from 'react';
import * as util from 'util';
import ContributionArea from 'pz-client/src/topic/contribution-area.component';
import SideSection from 'pz-client/src/side-section/side-section.component';
import {ITopicInstance} from 'pz-domain/src/models/topic';

interface ITopicState {
    topicContent;
    topic: ITopicInstance;
}

interface ITopicProps {
    params;
}

export default class TopicController extends Component<ITopicProps, ITopicState> {
    render() {
        return (
            <div className="topic-namespace" >
                {this._renderPrimarySection() }
                {this._renderSideSection() }
            </div>
        )
    }

    componentWillMount() {
        //Go look up topic slug and set it in the state
        this._lookupSlugInfo(this.props.params.topicSlug);
        //Get topic content and put in state
    }

    componentWillReceiveProps(nextProps) {
        //will have updated slug if user changed it via url
        this._lookupSlugInfo(nextProps.params.topicSlug);
        //Get topic content and put in state
    }

    _lookupSlugInfo(topicSlug) {
        const topic: ITopicInstance = {
            id: 123,
            name: this.props.params.topicSlug,
            description: "internal description",
            overviewContent: "This is where the wiki stuff will go",
            thumbnailPath: "sad",
            isVerified: true,
            save: () => { },
            destroy: () => { },
            toJSON: () => { }
        };
        this.setState({
            topicContent: "asdfghjk",
            topic: topic
        })
    }

    _renderPrimarySection() {
        return (
            <div className="primary-section" >
                {this._renderContributionSection() }
                {this._renderTopicContentSection() }
            </div>
        )
    }

    _renderContributionSection() {
        return (
            <ContributionArea addContribution={this._addContribution} />
        )
    }

    _renderTopicContentSection() {
        var content = {};
        //TODO: Populate content from backend

        if (content) {
            return this._renderTopicContent();
        }
        else {
            return this._renderEmptyContent();
        }
    }

    _renderTopicContent() {
        return this.state.topicContent;
    }

    _renderEmptyContent() {
        return (
            <div>
                <span>empty content</span>
            </div>
        ); //change to list of questions
    }

    _renderSideSection() {
        return (
            <div className="side-section-container">
                <SideSection topic={this.state.topic} />
            </div>
        )
    }

    _addContribution() {
        console.log("submited");
        var num = Math.random();
        return num > .5 ? Promise.resolve(true) : Promise.resolve(false);
    }
}

