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
import {CreateCommentEditor} from 'pz-client/src/comments/comment-editor-controller';
import Votes from 'pz-client/src/votes/votes-component';
import CreateCommentVoteMutation from 'pz-client/src/votes/create-comment-vote-mutation';
import UpdateCommentVoteMutation from 'pz-client/src/votes/update-comment-vote-mutation';
import DeleteCommentVoteMutation from 'pz-client/src/votes/delete-comment-vote-mutation';
import CreateCommentForCommentMutation from 'pz-client/src/comments/create-comment-for-comment-mutation';

export class Comment extends Component<any, any>{
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
                <ExpandButton onExpand={this.expand.bind(this)} />
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
                                upVoteClicked={this._onUpVoteClicked.bind(this) }
                                downVoteClicked={this._onDownVoteClicked.bind(this) }
                                totalVotes={comment.votes.total}
                                upVotes={comment.votes.upVotes}
                                userVote={comment.currentUserVote}
                                />
                        ) }
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

    expand() {
        this.props.relay.setVariables({
            expand: !this.props.relay.variables.expand
        });
    }

    private _onCommentSave(bodyData) {
        this.props.relay.commitUpdate(new CreateCommentForCommentMutation({
            bodyData: bodyData,
            comment: this.props.comment
        }));
    }

    private _onEditing(isEditingComment) {
        this.setState({ isEditingComment });
    }

    private _createVote(isUpVote: boolean) {
        this.props.relay.commitUpdate(new CreateCommentVoteMutation({
            isUpVote: isUpVote,
            comment: this.props.comment
        }));
    }

    private _deleteCurrentVote() {
        this.props.relay.commitUpdate(new DeleteCommentVoteMutation({
            comment: this.props.comment
        }));
    }

    private _updateCurrentVote(isUpVote: boolean) {
        this.props.relay.commitUpdate(new UpdateCommentVoteMutation({
            comment: this.props.comment,
            isUpVote: isUpVote
        }));
    }

    private _doVoteLogic(isUpVote: boolean) {
        const {currentUserVote} = this.props.comment;

        if (currentUserVote !== null) {
            if (currentUserVote === isUpVote)
                this._deleteCurrentVote();
            if (currentUserVote !== isUpVote)
                this._updateCurrentVote(isUpVote);
        }
        else {
            this._createVote(isUpVote);
        }
    }

    private _onUpVoteClicked() {
        this._doVoteLogic(true);
    }

    private _onDownVoteClicked() {
        this._doVoteLogic(false);
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
                votes {
                    upVotes
                    total
                }
                currentUserVote
                commentCount 
                ${CommentContent.getFragment('comment')}
                ${Avatar.getFragment('comment')}
                ${CommentList.getFragment('comment', { currentDepth }).if(expand)}
                ${CreateCommentEditor.getFragment('comment')}
                ${CreateCommentVoteMutation.getFragment('comment')}
                ${DeleteCommentVoteMutation.getFragment('comment')}
                ${UpdateCommentVoteMutation.getFragment('comment')}
                ${CreateCommentForCommentMutation.getFragment('comment')}
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