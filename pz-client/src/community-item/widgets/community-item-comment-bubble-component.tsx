import * as React from 'react';
import { Component } from 'react';
import * as Relay from 'react-relay';
import classNames from 'classnames';

class CommunityItem extends Component<any, any> {
    render() {
        const {communityItem} = this.props;

        const bubbleClass = classNames('bubble', { 'hidden': communityItem.commentCount === 0 });

        return (
            <span className={bubbleClass}
                onClick={this.props.onClick.bind(this)}>
                {communityItem.commentCount}
            </span>
        )
    }
}

export default Relay.createContainer(CommunityItem, {
    fragments: {
        communityItem: () => Relay.QL`
            fragment on CommunityItem {
                commentCount
            }
        `
    }
});
