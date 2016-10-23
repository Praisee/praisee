import * as Relay from 'react-relay';

export default class UpdateCommentMutation extends Relay.Mutation {
    getMutation() {
        return Relay.QL`mutation { updateComment }`;
    }

    getVariables() {
        return {
            id: this.props.comment.id,
            bodyData: this.props.bodyData,
        };
    }
    getFatQuery() {
        return Relay.QL `
            fragment on UpdateCommentPayload {
                comment
            }
        `;
    }

    getConfigs() {
        return [{
            type: 'FIELDS_CHANGE',
            fieldIDs: {
                comment: this.props.comment.id
            }
        }];
    }

    getOptimisticResponse() {
        return {
            comment: {
                id: this.props.comment.id,
                bodyData: JSON.stringify(Object.assign({}, this.props.bodyData, {
                    value: JSON.parse(this.props.bodyData.value)
                }))
            }
        };
    }

    static fragments = {
        comment: () => Relay.QL`
            fragment on Comment {
                id,
                bodyData
            }
        `
    };
}
