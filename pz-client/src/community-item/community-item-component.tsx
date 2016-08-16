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
                <CommentList key={`communityItem-commentList-${communityItem.id}`}
                    communityItem={communityItem}
                    maxLevel={5}
                    currentLevel={0} />
            </div>
        )
    }
}

export default Relay.createContainer(Topic, {
    fragments: {
        communityItem: () => Relay.QL`
            fragment on CommunityItem {
                summary,
                body,
                ${CommentList.getFragment('communityItem')}
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