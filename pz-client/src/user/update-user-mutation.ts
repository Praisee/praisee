import * as Relay from 'react-relay';

export default class UpdateUserMutation extends Relay.Mutation {
    getMutation() {
        return Relay.QL`mutation { updateUser }`;
    }

    getVariables() {
        return {
            id: this.props.profile.user.id,
            displayName: this.props.displayName,
            bio: this.props.bio
        };
    }

    getFatQuery() {
        return Relay.QL`
            fragment on UpdateUserPayload {
                profile {
                    bio

                    user {
                        displayName
                        routePath
                    }
                }
                
                user {
                    displayName
                    routePath
                }
            }
        `;
    }

    getConfigs() {
        return [{
            type: 'FIELDS_CHANGE',
            fieldIDs: {
                user: this.props.profile.user.id,
                profile: this.props.profile.id
            }
        }];
    }

    //TODO: Get this optimistic respnse working
    // getOptimisticResponse() {
    //     const parentType = this.getParentType();
    //     const parent = this.props[parentType];
    //     const {comments, commentCount} = parent;
    //     comments.push({
    //         bodyData: this.props.bodyData
    //     })
    //     return {
    //         [parentType]: {
    //             id: parent.id,
    //             commentCount: commentCount + 1,
    //             comments: comments
    //         }
    //     };
    // }

    static fragments = {
        profile: () => Relay.QL`
            fragment on UserProfile {
                id

                user {
                    id
                }
            }
        `
    };
}
