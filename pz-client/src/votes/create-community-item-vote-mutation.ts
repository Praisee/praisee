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
            fragment on CreateVotePayload {
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
                communityItem: this.props.communityItemId
            }
        }];
    }

    static fragments = {
        communityItem: () => Relay.QL`
            fragment on CommunityItem {
                id
          }
        `
    };
}