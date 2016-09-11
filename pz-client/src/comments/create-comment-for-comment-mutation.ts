import * as Relay from 'react-relay';

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
                comment {
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
