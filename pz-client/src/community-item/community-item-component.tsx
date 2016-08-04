import * as React from 'react';
import {Component} from 'react';
import * as Relay from 'react-relay';
import * as util from 'util';
import {ICommunityItem} from 'pz-server/src/community-items/community-items';

class Topic extends Component<ICommunityItemProps, ICommuintyItemState> {
    constructor(props, context) {
        super(props, context);
    };

    render() {
        const {communityItem} = this.props;
        return (
            <div className="community-item">
                <h4>{communityItem.summary}</h4>
                <p>{communityItem.body}</p>
            </div>
        )
    }
}

export default Relay.createContainer(Topic, {
    fragments: {
        communityItem: () => Relay.QL`
            fragment on CommunityItem {
                summary,
                body
            }
        `
    }
});

interface ICommuintyItemState {
}

interface ICommunityItemProps {
    communityItem: ICommunityItem;
    body: string;
}