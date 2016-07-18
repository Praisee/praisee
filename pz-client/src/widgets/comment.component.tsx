import {Component} from 'react';
import * as React from 'react';
import * as Relay from 'react-relay';
import {SchemaInjector, ISchemaType} from 'pz-client/src/support/schema-injector';
import { DateDisplay } from 'pz-client/src/widgets/date-display.component'

class Comment extends Component<ICommentProps, any>{
    schemaInjector: SchemaInjector;

    constructor(props, context) {
        super(props, context);
        this.schemaInjector = new SchemaInjector(commentSchema);
    }

    render() {
        const {text, upVotes, downVotes, createdAt} = this.props;

        return this.schemaInjector.inject(
            <div className="comment">
                <DateDisplay date={createdAt} type="date-created" />
                <p className="text">{text}</p>
                <p>
                    <span className="upvote-count">{upVotes}</span>/5
                    <span className="downvote-count">{downVotes}</span> reviews
                </p>
            </div>
        );
    }
}

export default Relay.createContainer(Comment, {
    fragments: {
        votes: () => Relay.QL`
            fragment on Comment {
                text,
                createdAt,
                upVotes,
                downVotes
            }
        `
    }
});

export interface ICommentProps {
    text: string,
    commentId: number,
    upVotes: number,
    downVotes: number,
    createdAt: string
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