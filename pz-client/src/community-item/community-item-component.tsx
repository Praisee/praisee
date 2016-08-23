import * as React from 'react';
import {Component} from 'react';
import * as Relay from 'react-relay';
import {ICommunityItem} from 'pz-server/src/community-items/community-items';
import CommentList from 'pz-client/src/widgets/comment-list-component'
import Votes from 'pz-client/src/widgets/votes-component';

class Topic extends Component<ICommunityItemProps, ICommuintyItemState> {
    constructor(props, context) {
        super(props, context);
    };

    render() {
        const {communityItem} = this.props;
        const {user} = communityItem;

        return (
            <div className="community-item">
                <h5>{user.displayName}</h5>
                <h4>{communityItem.summary}</h4>
                <p>{communityItem.body}</p>
                 <Votes
                    key={`communityItem-votes-${communityItem.id}`}
                    communityItem={communityItem}
                    />
                <CommentList
                    key={`communityItem-commentList-${communityItem.id}`}
                    communityItem={communityItem}
                    comment={null}
                    expandTo={this.props.relay.variables.expandTo}
                    currentLevel={0}
                    />
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
                user {
                    displayName
                }
                ${CommentList.getFragment('communityItem', { expandTo: variables.expandTo })}
                ${Votes.getFragment('communityItem')}
            }
        `
    }
});

interface ICommuintyItemState {
}

interface ICommunityItemProps {
    communityItem: {
        id: number
        user: { displayName: string }
        summary: string
        body: string
        // bodyData?: IContentData
        createdAt: Date
        comments: any
    }
    body: string;
    relay: any;
}