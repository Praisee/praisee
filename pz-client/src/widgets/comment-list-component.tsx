import {Component} from 'react';
import * as React from 'react';
import * as Relay from 'react-relay';
import Comment from 'pz-client/src/widgets/comment-component';
import LoadMoreButton from 'pz-client/src/widgets/load-more-button-component';

class CommentList extends Component<ICommentProps, any>{
    expandChildren: boolean;

    constructor(props, context) {
        super(props, context);
    }

    render() {
        const comments = this.props.communityItem
            ? this.props.communityItem.comments
            : this.props.comment.comments;
        debugger

        let rows = "";
        if (comments) {
            rows = comments.edges.map(({node: comment}) =>
                <Comment
                    key={comment.id}
                    comment={comment}
                    expanded={this.props.currentLevel < this.props.maxLevel}
                    currentLevel={this.props.currentLevel + 1}
                    maxLevel={this.props.maxLevel} />
            );
        }

        const loadMore =
            comments.pageInfo.hasNextPage ?
                <LoadMoreButton
                    isLoading={this.state.isLoading}
                    onLoadMore={this._handleLoadMore}
                    /> :
                null;

        return (
            <div>
                { rows }
                {loadMore}
            </div>
        );
    }

    _handleLoadMore = () => {
        this.props.relay.setVariables({
            count: this.props.relay.variables.count + 10,
        }, ({ready, done, error, aborted}) => {
            this.setState({ isLoading: !ready && !(done || error || aborted) });
        });
    }
}

export default Relay.createContainer(CommentList, {
    initialVariables: {
        limit: 5,
        depth: 0,
        expanded: null,
    },
    fragments: {
        communityItem: ({limit, depth, expanded}) => Relay.QL`
            fragment on CommunityItem {
                comments(first: $limit) { 
                    pageInfo {
                        hasNextPage    
                    },
                    edges {
                        node {
                            ${Comment.getFragment('comment', { limit, depth, expanded })}
                        }
                    }
                }
            }
        `,
        comment: ({limit, depth, expanded}) => Relay.QL`
            fragment on Comment {
                comments(first: $limit) { 
                    pageInfo {
                        hasNextPage    
                    },
                    edges {
                        node {
                            ${Comment.getFragment('comment', { limit, depth, expanded })}
                        }
                    }
                }
            }
        `
    }
});

export interface ICommentProps {
    communityItem: {
        comments: any
    }
    comment: {
        comments: any
    }
    relay
    currentLevel
    maxLevel
}