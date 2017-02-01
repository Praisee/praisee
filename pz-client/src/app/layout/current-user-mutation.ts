import * as Relay from 'react-relay';

export default class CurrentUserMutation extends Relay.Mutation {
    getMutation() {
        return Relay.QL`mutation { getCurrentUser }`;
    }

    getVariables() {
        return { };
    }

    getFatQuery() {
        return Relay.QL`
            fragment on GetCurrentUserPayload {
                currentUser {
                    displayName
                    id
                    isLoggedIn
                    reputation
                    avatarInfo{
                        facebookId
                        googleId
                        emailHash
                    } 
                    trusterCount
                    isCurrentUser
                    email
                    serverId
                    username
                }
                rawUser {
                    displayName
                    id
                    reputation
                    trusterCount
                    isCurrentUser
                }
            }
        `;
    }

    getConfigs() {
        return [{
            type: 'FIELDS_CHANGE',
            fieldIDs: {
                currentUser: this.props.currentUser.id,
                rawUser: this.props.rawUserId
            }
        }];
    }

    static fragments = {
        currentUser: () => Relay.QL`
            fragment on CurrentUser {
                id
            }
        `,
    };
}
