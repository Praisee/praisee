import * as Relay from 'react-relay';

export default class DeleteCommunityItemVoteMutation extends Relay.Mutation {
    getMutation() {
        return Relay.QL`mutation {deleteVote}`;
    }

    getVariables() {
        return {
            communityItemId: this.props.communityItem.id,
            isUpVote: this.props.isUpVote
        };
    }

    getFatQuery() {
        return Relay.QL`
            fragment on DeleteVotePayload {
                communityItem { 
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
                communityItem: this.props.communityItem.id
            }
        }];
    }

    getOptimisticResponse() {
        const {currentUserVote, votes} = this.props.communityItem;
        return {
            communityItem: {
                id: this.props.communityItem.id,
                currentUserVote: null,
                votes: {
                    upVotes: currentUserVote ? votes.upVotes - 1 : votes.upVotes,
                    total: votes.total - 1,
                }
            }
        };
    }

    static fragments = {
        communityItem: () => Relay.QL`
         fragment on CommunityItem {
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