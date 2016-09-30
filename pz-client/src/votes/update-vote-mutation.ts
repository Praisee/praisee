import * as Relay from 'react-relay';

export default class UpdateVoteMutation extends Relay.Mutation {
    getParentType() {
        return this.props.comment ? "comment" : "communityItem";
    }

    getMutation() {
        return Relay.QL`mutation {updateVote}`;
    }

    getVariables() {
        const parentType = this.getParentType();

        return {
            isUpVote: this.props.isUpVote,
            [parentType + "Id"]: this.props[parentType].id,
            affectedUserId: this.props[parentType].user.id
        };
    }

    getFatQuery() {
        return Relay.QL`
            fragment on UpdateVotePayload {
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
                affectedUser {
                    reputation
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
                affectedUser: this.props[parentType].user.id,
                viewer: this.props.appViewerId
            }
        }];
    }

    getOptimisticResponse() {
        const parentType = this.getParentType();
        const parent = this.props[parentType];
        const {currentUserVote, votes} = parent;
        const {reputation} = this.props[parentType].user

        return {
            [parentType]: {
                id: parent.id,
                currentUserVote: !currentUserVote,
                votes: {
                    upVotes: currentUserVote ? votes.upVotes - 1 : votes.upVotes + 1
                }
            },
            affectedUser: {
                reputation: currentUserVote ? Math.max(0, reputation - 5) : reputation + 5
            }
        };
    }

    static fragments = {
        communityItem: () => Relay.QL`
            fragment on CommunityItemInterface {
                id
                currentUserVote
                user {
                    id,
                    reputation
                }
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
                user {
                    id
                }
                votes {
                    upVotes,
                    total
                }
            }
        `
    };
}
