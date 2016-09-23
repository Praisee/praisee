import * as Relay from 'react-relay';

export default class DeleteVoteMutation extends Relay.Mutation {
    getParentType() {
        return this.props.comment ? "comment" : "communityItem";
    }

    getMutation() {
        return Relay.QL`mutation {deleteVote}`;
    }

    getVariables() {
        const parentType = this.getParentType();

        return {
            [parentType + "Id"]: this.props[parentType].id
        };
    }

    getFatQuery() {
        return Relay.QL`
            fragment on DeleteVotePayload {
                communityItem { 
                    currentUserVote
                    votes {
                        upVotes
                        total
                    }
                }
                comment { 
                    currentUserVote
                    votes {
                        upVotes
                        total
                    }
                }
                viewer {
                    responseErrorsList
                }
            }
        `;
    }

    getConfigs() {
        const parentType = this.getParentType();

        return [{
            type: 'FIELDS_CHANGE',
            fieldIDs: {
                [parentType]: this.props[parentType].id,
                viewer: this.props.appViewerId
            }
        }];
    }

    getOptimisticResponse() {
        const parentType = this.getParentType();
        const parent = this.props[parentType];
        const {currentUserVote, votes} = parent;

        return {
            [parentType]: {
                id: parent.id,
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
        `,
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