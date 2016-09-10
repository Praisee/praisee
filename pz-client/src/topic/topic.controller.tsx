import * as React from 'react';
import {Component} from 'react';
import * as Relay from 'react-relay';
import * as util from 'util';
import {CreateItemEditor} from 'pz-client/src/community-item/commuity-item-editor.controller';
import SideSection from 'pz-client/src/topic/side-section/side-section.component';
import {ITopic} from 'pz-server/src/topics/topics';
import SchemaInjector, {ISchemaType} from 'pz-client/src/support/schema-injector';
import CommunityItem from 'pz-client/src/community-item/community-item-component';

interface IContext {
    showNotFoundError: any
}

export class TopicController extends Component<ITopicProps, ITopicState> {
    static contextTypes: React.ValidationMap<any> = {
        showNotFoundError: React.PropTypes.func.isRequired
    };

    context: IContext;

    constructor() {
        super();
    }

    render() {
        if (!this.props.topic) {
            this.context.showNotFoundError();
            return <span />;
        }

        return (
            <div className="topic-namespace" >
                <h2>{this.props.topic.name}</h2>
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
            <CreateItemEditor topic={this.props.topic} />
        )
    }

    _renderTopicContentSection() {
        if (this.props.topic.communityItems.edges.length > 0) {
            return this._renderTopicContent();
        }
        else {
            return this._renderEmptyContent();
        }
    }

    _renderTopicContent() {
        const rows = this.props.topic.communityItems.edges
            .map(({node}) =>
                <div key={node.id}>
                    <CommunityItem key={node.id} communityItem={node} />
                </div>
            );
        return (
            <div>
                { rows }
            </div>
        );
    }

    _renderEmptyContent() {
        return (
            <div>
                <span>feed us some content plz?...kthnxbai</span>
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
    initialVariables: {
        limit: 5
    },
    fragments: {
        topic: () => Relay.QL`
            fragment on Topic {
                id,
                name,
                
                communityItems(first: $limit) {
                     edges{
                        node{
                            id,
                            ${CommunityItem.getFragment('communityItem')}
                        }
                    }
                },
                
                ${SideSection.getFragment('topic')}
                ${CreateItemEditor.getFragment('topic')}
            }
        `
    }
});

interface ITopicState {
}

interface ITopicProps {
    params;
    topic?;
}
