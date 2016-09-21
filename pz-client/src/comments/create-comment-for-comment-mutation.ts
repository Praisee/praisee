import * as Relay from 'react-relay';

//TODO: Quick-win - Consolidate this and create-comment-for-community-item-mutation
export default class CreateCommentForCommentMutation extends Relay.Mutation {
    getMutation() {
        return Relay.QL`mutation { createComment }`;
    }

    getVariables() {
        return {
            bodyData: this.props.bodyData,
            commentId: this.props.comment.id
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
            }
        `;
    }

    getConfigs() {
        return [{
            type: 'FIELDS_CHANGE',
            fieldIDs: {
                comment: this.props.comment.id,
                viewer: this.props.appViewerId
            }
        }];
    }

    static fragments = {
        comment: () => Relay.QL`
            fragment on Comment {
                id
            }
        `,
    };
}
