import * as React from 'react';
import {Component} from 'react';
import * as Relay from 'react-relay';
import * as util from 'util';
import ContributionArea from 'pz-client/src/topic/contribution-area.component';
import SideSection from 'pz-client/src/side-section/side-section.component';
import {ITopic} from 'pz-server/src/topics/topics';
import SchemaInjector, {ISchemaType} from 'pz-client/src/support/schema-injector';

interface ITopicState {
}

interface ITopicProps {
    params;
    topic;
}

export class TopicController extends Component<ITopicProps, ITopicState> {
    constructor(){
        super();
    }

    render() {
        return (
            <div className="topic-namespace" >
                {this._renderPrimarySection() }
                {this._renderSideSection() }
            </div>
        )
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

        if (content) {
            return this._renderTopicContent();
        }
        else {
            return this._renderEmptyContent();
        }
    }

    _renderTopicContent() {
        return (
            <div>
                <span>{this.props.topic.name}</span>
            </div>
        ); 
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
                <SideSection topic={this.props.topic} />
            </div>
        )
    }

    _addContribution() {
        console.log("submited");
        var num = Math.random();
        return num > .5 ? Promise.resolve(true) : Promise.resolve(false);
    }
}

export default Relay.createContainer(TopicController, {
    fragments: {
        topic: () => Relay.QL`
            fragment on Topic {
                id,
                name,
                description,
                thumbnailPath,
                overviewContent,
                isVerified
            }
        `
    }
});
