import * as Relay from 'react-relay';
import * as React from 'react';
import {Component} from 'react';
import handleClick from 'pz-client/src/support/handle-click';
import classNames from 'classnames';

interface IReputationEarnedProps {
    communityItem?
    comment?
}

class ReputationEarned extends Component<IReputationEarnedProps, any>{
    render() {
        let parent = this.props.communityItem || this.props.comment
        return (
            <div className="reputation-earned">
                <span className="reputation-earned-amount">
                    +{parent.reputationEarned}
                </span>
                <i className="reputation-earned-heart" />
                <span> earned</span>
            </div>
        );
    }
}

export default Relay.createContainer(ReputationEarned, {
    fragments: {
        communityItem: () => Relay.QL`
            fragment on CommunityItemInterface {
                reputationEarned
            }
        `,
        comment: () => Relay.QL`
            fragment on Comment {
                reputationEarned
            }
        `
    }
});

