import * as React from 'react';
import {Component} from 'react';
import * as Relay from 'react-relay';
import * as util from 'util';
import {CreateItemEditor} from 'pz-client/src/community-item/community-item-editor.component';
import SideSection from 'pz-client/src/topic/side-section/side-section.component';
import {ITopic} from 'pz-server/src/topics/topics';
import SchemaInjector, {ISchemaType} from 'pz-client/src/support/schema-injector';
import CommunityItem from 'pz-client/src/community-item/community-item-component';
import ExpandButton from 'pz-client/src/widgets/expand-button-component'

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
                <CommunityItem key={node.id} communityItem={node} truncateLongContent={true} />
            );

        let expandButton = null;
        if (this.props.topic.communityItemCount > this.props.relay.variables.limit) {
            expandButton = (
                <ExpandButton onExpand={this._showMoreCommunityItems.bind(this) } />
            )
        }

        return (
            <div>
                {rows}
                {expandButton}
            </div>
        );
    }

    _renderEmptyContent() {
        return (
            <div>
                <span>Be the first to review, ask a question, or talk about {this.props.topic.name}</span>
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

    _showMoreCommunityItems() {
        this.props.relay.setVariables({ limit: this.props.relay.variables.limit + 5 })
    }
}

export default Relay.createContainer(TopicController, {
    initialVariables: {
        limit: 5
    },
    fragments: {
        topic: () => Relay.QL`
            fragment on Topic {
                id
                name                
                communityItemCount
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
    topic?: {
        id
        name
        communityItemCount
        communityItems
    };
    relay;
}
