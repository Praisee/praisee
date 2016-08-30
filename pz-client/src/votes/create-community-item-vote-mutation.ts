import * as Relay from 'react-relay';

export default class CreateCommunityItemVoteMutation extends Relay.Mutation {
    getMutation() {
        return Relay.QL`mutation {createCommunityItemVote}`;
    }

    getVariables() {
        return {
            communityItemId: this.props.communityItem.id,
            isUpVote: this.props.isUpVote
        };
    }

    getFatQuery() {
        return Relay.QL`
            fragment on CreateCommunityItemVotePayload {
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
                currentUserVote: this.props.isUpVote,
                votes: {
                    upVotes: this.props.isUpVote ? votes.upVotes + 1 : votes.upVotes,
                    total: votes.total + 1,
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