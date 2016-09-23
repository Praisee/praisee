import * as React from 'react';
import {Component} from 'react';
import * as Relay from 'react-relay';
import * as util from 'util';
import SideSection from 'pz-client/src/topic/side-section/side-section.component';
import {ITopic} from 'pz-server/src/topics/topics';
import SchemaInjector, {ISchemaType} from 'pz-client/src/support/schema-injector';
import CommunityItem from 'pz-client/src/community-item/community-item-component';
import CommentList from 'pz-client/src/comments/comment-list-component';

interface IContext {
    showNotFoundError: any
}

export class CommunityItemController extends Component<ICommunityItemProps, ICommunityItemState> {
    static contextTypes: React.ValidationMap<any> = {
        showNotFoundError: React.PropTypes.func.isRequired
    };

    context: IContext;

    constructor() {
        super();
    }

    render() {
        if (!this.props.communityItem) {
            this.context.showNotFoundError();
            return <span />;
        }

        let {communityItem} = this.props;

        return (
            <div className="community-item-namespace" >
                <CommunityItem key={communityItem.id} communityItem={communityItem} />
            </div>
        )
    }

    _renderCommunityItemContent() {
    }
}

export default Relay.createContainer(CommunityItemController, {
    fragments: {
        communityItem: () => Relay.QL`
            fragment on CommunityItem {
                ${CommunityItem.getFragment('communityItem')}
            }
        `
    }
});

interface ICommunityItemState {
}

interface ICommunityItemProps {
    params;
    communityItem?;
    relay;
}
