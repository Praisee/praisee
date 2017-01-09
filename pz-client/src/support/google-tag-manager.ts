if (typeof window !== 'undefined' && !window['dataLayer']) {
    console.error('No Google Tag Manager dataLayer variable was defined on the page');
}

export class GoogleTagManagerModule {
    private _dataLayer = (typeof window !== 'undefined' && window['dataLayer']) || [];

    public triggerSignUp() {
        this._triggerEvent('signUp');
    }

    public triggerSignIn() {
        this._triggerEvent('signIn');
    }

    public triggerCommentUpvote() {
        this._triggerEvent('commentUpvote');

        this._triggerUpvote();
        this._triggerCommentVote();
        this._triggerVote();
    }

    public triggerCommentDownvote() {
        this._triggerEvent('commentDownvote');

        this._triggerDownvote();
        this._triggerCommentVote();
        this._triggerVote();
    }

    public triggerAttemptedCommentUpvote() {
        this._triggerEvent('attemptedCommentUpvote');

        this._triggerAttemptedVote();
    }

    public triggerAttemptedCommentDownvote() {
        this._triggerEvent('attemptedCommentDownvote');

        this._triggerAttemptedVote();
    }

    public triggerPostUpvote() {
        this._triggerEvent('postUpvote');

        this._triggerUpvote();
        this._triggerPostVote();
        this._triggerVote();
    }

    public triggerPostDownvote() {
        this._triggerEvent('postDownvote');

        this._triggerDownvote();
        this._triggerPostVote();
        this._triggerVote();
    }

    public triggerAttemptedPostUpvote() {
        this._triggerEvent('attemptedPostUpvote');

        this._triggerAttemptedVote();
    }

    public triggerAttemptedPostDownvote() {
        this._triggerEvent('attemptedPostDownvote');

        this._triggerAttemptedVote();
    }

    public triggerComment() {
        this._triggerEvent('comment');

        this._triggerContribution();
    }

    public triggerSetReviewRating() {
        this._triggerEvent('setReviewRating');
    }

    public triggerReviewPost() {
        this._triggerEvent('reviewPost');

        this._triggerPost();
    }

    public triggerGeneralPost() {
        this._triggerEvent('generalPost');

        this._triggerPost();
    }

    public triggerQuestionPost() {
        this._triggerEvent('questionPost');

        this._triggerPost();
    }

    public triggerTrust() {
        this._triggerEvent('trust');

        this._triggerUserSpecificActivity();
    }

    public triggerAttemptedTrust() {
        this._triggerEvent('attemptedTrust');
        this._triggerAttemptedUserSpecificActivity();
    }

    public _triggerUpvote() {
        this._triggerEvent('upvote');
    }

    public _triggerDownvote() {
        this._triggerEvent('downvote');
    }

    private _triggerPostVote() {
        this._triggerEvent('postVote');
    }

    private _triggerCommentVote() {
        this._triggerEvent('commentVote');
    }

    private _triggerVote() {
        this._triggerEvent('vote');

        this._triggerUserSpecificActivity();
    }

    private _triggerAttemptedVote() {
        this._triggerEvent('attemptedVote');
        this._triggerAttemptedUserSpecificActivity();
    }

    public _triggerPost() {
        this._triggerEvent('post');

        this._triggerContribution();
    }

    private _triggerContribution() {
        this._triggerEvent('contribution');

        this._triggerUserSpecificActivity();
    }

    private _triggerUserSpecificActivity() {
        this._triggerEvent('userSpecificActivity');
    }

    private _triggerAttemptedUserSpecificActivity() {
        this._triggerEvent('attemptedUserSpecificActivity');
    }

    private _triggerEvent(eventName) {
        this._dataLayer.push({event: eventName});

        if (process.env.NODE_ENV !== 'production') {
            console.log('Triggered event ' + eventName);
        }
    }
}

export default new GoogleTagManagerModule();
