import * as Relay from 'react-relay';

export default class ToggleTrustMutation extends Relay.Mutation {
    getMutation() {
        return Relay.QL`mutation { toggleTrust }`;
    }

    getVariables() {
        return {
            trustedId: this.props.user.id
        };
    }

    getFatQuery() {
        return Relay.QL`
            fragment on ToggleTrustPayload {
                viewer {
                    responseErrorsList
                }
                trustedUser {
                    trusterCount
                }
            }
        `;
    }

    getConfigs() {
        return [{
            type: 'FIELDS_CHANGE',
            fieldIDs: {
                trustedUser: this.props.user.id,
                viewer: this.props.appViewerId
            }
        }];
    }

    static fragments = {
        user: () => Relay.QL`
            fragment on UserInterface {
                id
            }
        `,
    };
}
