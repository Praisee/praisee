import * as Relay from 'react-relay';

export default class CreateCommentFromCommunityItemMutation extends Relay.Mutation {
    getMutation() {
        return Relay.QL`mutation { createComment }`;
    }

    getVariables() {
        return {
            bodyData: this.props.bodyData,
            communityItemId: this.props.communityItem.id,
        };
    }

    getFatQuery() {
        return Relay.QL `
            fragment on CreateCommentPayload {
                communityItem {
                    comments
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

    static fragments = {
        communityItem: () => Relay.QL`
            fragment on CommunityItem {
                id
            }
        `,
    };
}