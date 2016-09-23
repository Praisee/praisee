import {Component} from 'react';
import * as React from 'react';
import * as Relay from 'react-relay';
import SchemaInjector, {ISchemaType} from 'pz-client/src/support/schema-injector';
import {DateDisplay} from 'pz-client/src/widgets/date-display.component'
import ExpandButton from 'pz-client/src/widgets/expand-button-component'
import {IComment} from 'pz-server/src/comments/comments';
import CommentContent from 'pz-client/src/comments/comment-content-component';
import CommentList from 'pz-client/src/comments/comment-list-component';
import Avatar from 'pz-client/src/user/avatar.component';
import {CreateCommentEditor} from 'pz-client/src/comments/comment-editor-component';
import Votes from 'pz-client/src/votes/votes-component';
import CreateCommentForCommentMutation from 'pz-client/src/comments/create-comment-for-comment-mutation';
import CurrentUserType from 'pz-client/src/user/current-user-type';
import {SignInUpContextType, ISignInUpContext} from 'pz-client/src/user/sign-in-up-overlay-component';

export class Comment extends Component<any, any>{
    static contextTypes: any = {
        appViewerId: React.PropTypes.string.isRequired,
        currentUser: CurrentUserType,
        signInUpContext: SignInUpContextType
    };

    context: {
        appViewerId: number,
        currentUser: any,
        signInUpContext: ISignInUpContext
    };

    schemaInjector: SchemaInjector;

    constructor(props, context) {
        super(props, context);
        this.schemaInjector = new SchemaInjector(commentSchema);
        this.state = { isEditingComment: false };
    }

    render() {
        const {comment} = this.props;
        const {comments, upVotes, downVotes, createdAt, commentCount} = comment;
        const {currentDepth, expand} = this.props.relay.variables;
        const {currentUser} = this.context;

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
        if (!expand && commentCount > 0) {
            expandButton = (
                <ExpandButton onExpand={this._expand.bind(this)} />
            )
        }

        return this.schemaInjector.inject(
            <div className="comment">
                <header className="comment-header">
                    <Avatar communityItem={null} comment={comment} />
                    <DateDisplay date={createdAt} type="date-created" />
                </header>
                <div className="comment-inner">
                    <CommentContent comment={comment} />
                    <div className="comment-bottom">
                        {!this.state.isEditingComment && (
                            <Votes
                                key={`comment-votes-${comment.id}`}
                                comment={this.props.comment}
                                communityItem={null} />
                        )}
                        <CreateCommentEditor
                            comment={comment}
                            communityItem={null}
                            onSave={this._onCommentSave.bind(this) }
                            onEditing={this._onEditing.bind(this) } />
                    </div>
                    {expandButton}
                </div>
                {commentList}
            </div>
        );
    }

    private _isCurrentUserOwner() {
        return this.context.currentUser && this.context.currentUser.id === this.props.comment.user.id;
    }

    private _expand() {
        this.props.relay.setVariables({
            expand: !this.props.relay.variables.expand
        });
    }

    private _onCommentSave(bodyData) {
        this.props.relay.commitUpdate(new CreateCommentForCommentMutation({
            bodyData: bodyData,
            comment: this.props.comment,
            appViewerId: this.context.appViewerId
        }));
    }

    private _onEditing(isEditingComment) {
        this.setState({ isEditingComment });
    }
}

export default Relay.createContainer(Comment, {
    initialVariables: {
        expand: false,
        currentDepth: 1
    },
    fragments: {
        comment: ({expand, currentDepth}) => Relay.QL`
            fragment on Comment {
                createdAt
                commentCount 
                user {
                    id
                }
                ${CommentContent.getFragment('comment')}
                ${Avatar.getFragment('comment')}
                ${CommentList.getFragment('comment', { currentDepth }).if(expand)}
                ${CreateCommentEditor.getFragment('comment')}
                ${CreateCommentForCommentMutation.getFragment('comment')}
                ${Votes.getFragment('comment')}
            } 
        `
    }
});

export interface ICommentProps {
    comment: IComment
    relay
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
