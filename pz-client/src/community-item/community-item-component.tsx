import * as React from 'react';
import {Component} from 'react';
import * as Relay from 'react-relay';
import * as util from 'util';
import {ICommunityItem} from 'pz-server/src/community-items/community-items';
import CommentList from 'pz-client/src/widgets/comment-list-component'

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
                <CommentList
                    key={`communityItem-commentList-${communityItem.id}`}
                    communityItem={communityItem}
                    comment={null}
                    expandTo={this.props.relay.variables.expandTo}
                    currentLevel={0} />
            </div>
        )
    }
}

export default Relay.createContainer(Topic, {
    initialVariables: {
        expandTo: 5
    },
    fragments: {
        communityItem: (variables) => Relay.QL`
            fragment on CommunityItem {
                summary,
                body,
                ${CommentList.getFragment('communityItem', { expandTo: variables.expandTo })}
            }
        `
    }
});

interface ICommuintyItemState {
}

interface ICommunityItemProps {
    communityItem: ICommunityItem;
    body: string;
    relay: any;
}