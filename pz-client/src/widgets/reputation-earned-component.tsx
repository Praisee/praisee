import * as Relay from 'react-relay';
import * as React from 'react';
import {Component} from 'react';
import handleClick from 'pz-client/src/support/handle-click';
import classNames from 'classnames';

interface IExpandProps{
    communityItem
}

class ReputationEarned extends Component<IExpandProps, any>{
    render() {
        return (
            <div className="reputation-earned">
                <span className="reputation-earned-amount">+{this.props.communityItem.reputationEarned}</span>
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
        `
    }
});

