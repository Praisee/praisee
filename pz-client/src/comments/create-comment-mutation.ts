import * as Relay from 'react-relay';

export default class CreateCommentMutation extends Relay.Mutation {
    getParentType() {
        return this.props.comment ? "comment" : "communityItem";
    }

    getMutation() {
        return Relay.QL`mutation { createComment }`;
    }

    getVariables() {
        const parentType = this.getParentType();

        return {
            bodyData: this.props.bodyData,
            [parentType + "Id"]: this.props[parentType].id
        };
    }

    getFatQuery() {
        return Relay.QL`
            fragment on CreateCommentPayload {
                viewer {
                    responseErrorsList
                }
                comment {
                    commentCount
                    comments
                }
                communityItem {
                    commentCount
                    comments
                }
            }
        `;
    }

    getConfigs() {
        const parentType = this.getParentType();
        //TODO: Dont use FIELDS_CHANGE - User RANGE_ADD instead
        return [{
            type: 'FIELDS_CHANGE',
            fieldIDs: {
                [parentType]: this.props[parentType].id,
                viewer: this.props.appViewerId
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
        comment: () => Relay.QL`
            fragment on Comment {
                id
                comments
            }
        `,
        communityItem: () => Relay.QL`
            fragment on CommunityItem {
                id
                comments
            }
        `,
    };
}
