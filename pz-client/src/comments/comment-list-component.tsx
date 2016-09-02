import {Component} from 'react';
import * as React from 'react';
import * as Relay from 'react-relay';
import Comment from 'pz-client/src/comments/comment-component';
import LoadMoreButton from 'pz-client/src/widgets/load-more-button-component';

class CommentList extends Component<ICommentProps, any>{
    expandChildren: boolean;

    constructor(props, context) {
        super(props, context);
    }

    render() {
        const parent = this.props.communityItem || this.props.comment;
        const {currentDepth, expand} = this.props.relay.variables;

        const comments = parent.comments.map((comment) =>
            <Comment
                key={comment.id}
                comment={comment}
                expand={expand}
                currentDepth={currentDepth} />
        );

        return (
            <div className="comment-list-namespace">
                {comments}
            </div>
        );
    }
}

export default Relay.createContainer(CommentList, {
    initialVariables: {
        currentDepth: 1,
        expandCommentsTo: 5,
        expand: false
    },
    prepareVariables: (previousVariables: any) => {
        let {currentDepth, expandCommentsTo} = previousVariables;

        return {
            expand: currentDepth < expandCommentsTo,
            currentDepth
        };
    },
    fragments: {
        communityItem: ({expand, currentDepth}) => Relay.QL`
            fragment on CommunityItem {
                comments {
                    id,
                    ${Comment.getFragment('comment', { expand, currentDepth })}
                }
            }
        `,
        comment: ({expand, currentDepth}) => Relay.QL`
            fragment on Comment {
                comments {
                    id,
                    ${Comment.getFragment('comment', { expand, currentDepth })}
                }
            }
        `
    }
});

export interface ICommentProps {
    communityItem;
    comment;
    relay;
}