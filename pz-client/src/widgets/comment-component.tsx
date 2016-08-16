import {Component} from 'react';
import * as React from 'react';
import * as Relay from 'react-relay';
import SchemaInjector, {ISchemaType} from 'pz-client/src/support/schema-injector';
import { DateDisplay } from 'pz-client/src/widgets/date-display.component'
import {IComment} from 'pz-server/src/comments/comments';
import CommentList from 'pz-client/src/widgets/comment-list-component'

class Comment extends Component<ICommentProps, any>{
    schemaInjector: SchemaInjector;

    constructor(props, context) {
        super(props, context);
        this.schemaInjector = new SchemaInjector(commentSchema);
    }

    render() {
        const {comment, currentLevel, maxLevel} = this.props;
        const {body, upVotes, downVotes, createdAt} = comment;

        let commentList = null;
        if (this.props.relay.expanded) {
            commentList = (<CommentList key={`comment-commentList-${comment.id}`}
                communityItem={null}
                comment={comment}
                currentLevel={currentLevel}
                maxLevel={maxLevel} />)
        }

        return (
            <div className="comment" style={{ paddingLeft: "15px" }}>
                <DateDisplay date={createdAt} type="date-created" />
                <p className="text">{body}</p>
                <p>
                    <span className="upvote-count">{upVotes}</span>/5
                    <span className="downvote-count">{downVotes}</span> reviews
                </p>

                {!this.props.relay.variables.expanded ?
                    <div className="btn btn-primary" onClick={this.onClickHead.bind(this) }>More Comments</div>
                    : null }
                {commentList}
            </div>
        );
    }

    onClickHead() {
        this.props.relay.setVariables({ expanded: true });
    }
}

export default Relay.createContainer(Comment, {
    initialVariables: {
        expanded: false,
    },
    fragments: {
        comment: ({expanded, depth}) => Relay.QL`
            fragment on Comment {
                body,
                createdAt,
                upVotes,
                downVotes,
                ${CommentList.getFragment('comment').if(expanded)}
            } 
        `
    }
});

export interface ICommentProps {
    comment: IComment
    relay
    currentLevel
    maxLevel
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