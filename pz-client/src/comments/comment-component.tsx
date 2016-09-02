import {Component} from 'react';
import * as React from 'react';
import * as Relay from 'react-relay';
import SchemaInjector, {ISchemaType} from 'pz-client/src/support/schema-injector';
import {DateDisplay} from 'pz-client/src/widgets/date-display.component'
import {IComment} from 'pz-server/src/comments/comments';
import CommentContent from 'pz-client/src/comments/comment-content-component';
import CommentList from 'pz-client/src/comments/comment-list-component';
import Avatar from 'pz-client/src/user/avatar.component';

export class Comment extends Component<any, any>{
    schemaInjector: SchemaInjector;

    constructor(props, context) {
        super(props, context);
        this.schemaInjector = new SchemaInjector(commentSchema);
    }

    render() {
        const {comment} = this.props;
        const {comments, upVotes, downVotes, createdAt} = comment;
        const {currentDepth, expand} = this.props.relay.variables;

        let commentList = null;
        if (expand) {
            commentList = (
                <CommentList
                    key={`comment-commentList-${comment.id}`}
                    comment={comment}
                    communityItem={null}
                    currentDepth={currentDepth}
                    />
            );
        }

        let expandButton = null;
        if(!expand){
            expandButton = (
                <button type="button" onClick={this.expand.bind(this)} >...</button>
            )
        }

        return this.schemaInjector.inject(
            <div className="comment" style={{ paddingLeft: "15px" }}>
                <Avatar communityItem={null} comment={comment} />
                <DateDisplay date={createdAt} type="date-created" />
                <CommentContent comment={comment} />
                {expandButton}
                {commentList}
            </div>
        );
    }

    expand() {
        this.props.relay.setVariables({
            expand: !this.props.relay.variables.expand
        });
    }
}

export default Relay.createContainer(Comment, {
    initialVariables: {
        expand: false,
        currentDepth: 1
    },
    prepareVariables: (previousVariables: any) => {
        let {currentDepth, expand} = previousVariables;

        return {
            currentDepth: currentDepth + 1,
            expand 
        };
    },
    fragments: {
        comment: ({expand, currentDepth}) => Relay.QL`
            fragment on Comment {
                createdAt,
                upVotes,
                downVotes,
                ${CommentContent.getFragment('comment')},
                ${Avatar.getFragment('comment')}
                ${CommentList.getFragment('comment', { currentDepth}).if(expand)},
            } 
        `
    }
});

export interface ICommentProps {
    comment: IComment
    relay
    maxLevel: number
    currentDepth: number
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