import {Component} from 'react';
import * as React from 'react';
import * as Relay from 'react-relay';
import {Comment, CommentList as DummyList} from 'pz-client/src/widgets/comment-component';
import LoadMoreButton from 'pz-client/src/widgets/load-more-button-component';

class CommentList extends Component<ICommentProps, any>{
    expandChildren: boolean;

    constructor(props, context) {
        super(props, context);
    }

    render() {
        let comments = this.props.communityItem.comments.map((comment) => {
            return Object.assign({}, comment, {
                comments: JSON.parse(comment.comments)
            });
        });

        return (
            <DummyList comments={comments} />
        );
    }
}

export default Relay.createContainer(CommentList, {
    fragments: {
        communityItem: ({limit, currentDepth, expandChild}) => Relay.QL`
            fragment on CommunityItem {
                comments {
                    body,
                    createdAt,
                    id,
                    comments
                }
            }
        `
    }
});

export interface ICommentProps {
    communityItem
}