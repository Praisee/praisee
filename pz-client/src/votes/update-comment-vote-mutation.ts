import * as Relay from 'react-relay';

export default class DeleteCommentVoteMutation extends Relay.Mutation {
    getMutation() {
        return Relay.QL`mutation {updateVote}`;
    }

    getVariables() {
        return {
            commentId: this.props.comment.id,
            isUpVote: this.props.isUpVote
        };
    }

    getFatQuery() {
        return Relay.QL`
            fragment on UpdateVotePayload {
                comment { 
                    currentUserVote
                    votes {
                        upVotes,
                        total
                    }
                }
            }
        `;
    }

    getConfigs() {
        return [{
            type: 'FIELDS_CHANGE',
            fieldIDs: {
                comment: this.props.comment.id
            }
        }];
    }

    getOptimisticResponse() {
        const {currentUserVote, votes} = this.props.comment;
        return {
            comment: {
                id: this.props.comment.id,
                currentUserVote: !currentUserVote,
                votes: {
                    upVotes: currentUserVote ? votes.upVotes - 1 : votes.upVotes + 1
                }
            }
        };
    }

    static fragments = {
        comment: () => Relay.QL`
         fragment on Comment {
            id
            currentUserVote
            votes {
                upVotes,
                total
            }
        }
        `
    };
}