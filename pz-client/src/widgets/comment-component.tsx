import {Component} from 'react';
import * as React from 'react';
import * as Relay from 'react-relay';
import SchemaInjector, {ISchemaType} from 'pz-client/src/support/schema-injector';
import { DateDisplay } from 'pz-client/src/widgets/date-display.component'
import {IComment} from 'pz-server/src/comments/comments';

export class Comment extends Component<any, any>{
    schemaInjector: SchemaInjector;

    constructor(props, context) {
        super(props, context);
        this.schemaInjector = new SchemaInjector(commentSchema);
    }

    render() {
        const {comment} = this.props;
        const {comments, body, upVotes, downVotes, createdAt} = comment;

        let commentList = null;
        if (comments.length > 0) {
            commentList = (
                <CommentList key={`comment-commentList-${comment.id}`}
                    comments={comments}
                />
            );
        }

        return (
            <div className="comment" style={{ paddingLeft: "15px" }}>
                <DateDisplay date={createdAt} type="date-created" />
                <p className="text">{body}</p>
                <p>
                    <span className="upvote-count">{upVotes}</span>/5
                    <span className="downvote-count">{downVotes}</span> reviews
                </p>

                {commentList}
            </div>
        );
    }
}

export class CommentList extends Component<any, any>{
    expandChildren: boolean;

    constructor(props, context) {
        super(props, context);
    }

    render() {
        const {comments} = this.props;

        return (
            <div>
                {comments.map((comment) => (
                    <Comment
                        key={'comment' + comment.id}
                        comment={comment} />
                )) }
            </div>
        );
    }
}
// export default Relay.createContainer(Comment, {
//     initialVariables: {
//         expanded: false,
//         currentDepth: 0
//     },
//     fragments: {
//         comment: ({expanded, currentDepth}) => Relay.QL`
//             fragment on Comment {
//                 body,
//                 createdAt,
//                 upVotes,
//                 downVotes,
//                 ${CommentList.getFragment('comment', { currentDepth }).if(expanded)}
//             } 
//         `
//     }
// });

export interface ICommentProps {
    comment: IComment
    relay
    maxLevel
    currentDepth
}

var commentSchema: ISchemaType = {
    "comment": {
        property: "comment",
        typeof: "Comment"
    },
    "text": {
        property: "text"
    },
    "votes": {
        property: "aggregateRating",
        typeof: "AggregateRating"
    },
    "downvote-count":
    {
        property: "downvoteCount"
    },
    "upvote-count": {
        property: "upvoteCount"
    },
    "parent-item": {
        property: "parentItem"
    },
    "date-created": {
        property: "dateCreated"
    }
}