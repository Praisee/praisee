import * as React from 'react';
import { Component } from 'react';
import * as Relay from 'react-relay';
import CreateVoteMutation from 'pz-client/src/votes/create-vote-mutation';
import UpdateVoteMutation from 'pz-client/src/votes/update-vote-mutation';
import DeleteVoteMutation from 'pz-client/src/votes/delete-vote-mutation';
import { ISignInUpContext, SignInUpContextType } from 'pz-client/src/user/sign-in-up-overlay-component';
import classNames from 'classnames';
import SchemaInjector, { ISchemaType } from 'pz-client/src/support/schema-injector';
import handleClick from 'pz-client/src/support/handle-click';
import GoogleTagManager from 'pz-client/src/support/google-tag-manager';

class Votes extends React.Component<IVotesProps, any> {
    schemaInjector: SchemaInjector;

    static contextTypes: any = {
        appViewerId: React.PropTypes.string.isRequired,
        signInUpContext: SignInUpContextType
    };

    context: {
        appViewerId: number,
        signInUpContext: ISignInUpContext
    };

    constructor(props, context) {
        super(props, context);
        this.schemaInjector = new SchemaInjector(aggregateRatingSchema);
    }

    render() {
        const parent = this.props.comment || this.props.communityItem;
        const {totalVotes, upVotes} = parent.votes;
        const {currentUserVote} = parent;

        const upVoteClasses = classNames('up-vote', { 'current-vote': currentUserVote === true });
        const downVoteClasses = classNames('down-vote', { 'current-vote': currentUserVote === false }); //userVote is true, false or null

        return this.schemaInjector.inject(
            <span className="aggregate-rating votes">
                <button type="button"
                    className={upVoteClasses}
                    onClick={handleClick(this._doVoteLogic.bind(this, true))}>
                    <span className="up-vote-icon"></span>
                    {currentUserVote === true ? "Upvoted" : "Upvote"}
                </button>
                <button type="button"
                    className={downVoteClasses}
                    onClick={handleClick(this._doVoteLogic.bind(this, false))}>
                    <span className="down-vote-icon"></span>
                    {currentUserVote === false ? "Downvoted" : "Downvote"}
                </button>
            </span>
        );
    }

    private _createVote(isUpVote: boolean) {
        this._triggerGoogleTagManagerEvent(isUpVote, false);

        this.props.relay.commitUpdate(new CreateVoteMutation({
            isUpVote: isUpVote,
            communityItem: this.props.communityItem,
            comment: this.props.comment,
            appViewerId: this.context.appViewerId
        }));
    }

    private _deleteCurrentVote() {
        this.props.relay.commitUpdate(new DeleteVoteMutation({
            communityItem: this.props.communityItem,
            comment: this.props.comment,
            appViewerId: this.context.appViewerId
        }));
    }

    private _updateCurrentVote(isUpVote: boolean) {
        this._triggerGoogleTagManagerEvent(isUpVote, false);

        this.props.relay.commitUpdate(new UpdateVoteMutation({
            isUpVote: isUpVote,
            communityItem: this.props.communityItem,
            comment: this.props.comment,
            appViewerId: this.context.appViewerId
        }));
    }

    private _doVoteLogic(isUpVote: boolean) {
        if (!this.context.signInUpContext.isLoggedIn()) {
            this._triggerGoogleTagManagerEvent(isUpVote, true);
            this.context.signInUpContext.showMustSignInUp();
            return;
        }

        const parent = this.props.comment || this.props.communityItem;
        const {currentUserVote} = parent;

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

    private _triggerGoogleTagManagerEvent(isUpVote: boolean, isAttempt: boolean) {
        if (isAttempt) {
            if (this.props.communityItem) {
                if (isUpVote) {
                    GoogleTagManager.triggerAttemptedPostUpvote();
                } else {
                    GoogleTagManager.triggerAttemptedPostDownvote();
                }
            } else {
                if (isUpVote) {
                    GoogleTagManager.triggerAttemptedCommentUpvote();
                } else {
                    GoogleTagManager.triggerAttemptedCommentDownvote();
                }
            }
        } else {
            if (this.props.communityItem) {
                if (isUpVote) {
                    GoogleTagManager.triggerPostUpvote();
                } else {
                    GoogleTagManager.triggerPostDownvote();
                }
            } else {
                if (isUpVote) {
                    GoogleTagManager.triggerCommentUpvote();
                } else {
                    GoogleTagManager.triggerCommentDownvote();
                }
            }
        }
    }
}

export default Relay.createContainer(Votes, {
    fragments: {
        communityItem: () => Relay.QL`
            fragment on CommunityItemInterface {
                currentUserVote
                votes{
                    upVotes
                    total
                }
                ${CreateVoteMutation.getFragment('communityItem')}
                ${DeleteVoteMutation.getFragment('communityItem')}
                ${UpdateVoteMutation.getFragment('communityItem')}
            }
        `,
        comment: () => Relay.QL`
            fragment on Comment {
                currentUserVote
                votes{
                    upVotes
                    total
                }
                ${CreateVoteMutation.getFragment('comment')}
                ${DeleteVoteMutation.getFragment('comment')}
                ${UpdateVoteMutation.getFragment('comment')}
            }
        `,
    }
});

interface IVotesProps {
    communityItem?: {
        votes: {
            upVotes: number
            totalVotes: number
        }
        currentUserVote?: boolean
    };
    comment?: {
        votes: {
            upVotes: number
            totalVotes: number
        }
        currentUserVote?: boolean
    }
    relay?: any
}

var aggregateRatingSchema: ISchemaType = {
    "aggregate-rating":
    {
        property: "aggregateRating",
        typeof: "AggregateRating"
    },
    "rating-value": {
        property: "ratingValue"
    },
    "review-count": {
        property: "ratingCount"
    }
};
