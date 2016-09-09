import * as Relay from 'react-relay';

export default class CreateCommentFromCommunityItemMutation extends Relay.Mutation {
    // This method should return a GraphQL operation that represents
    // the mutation to be performed. This presumes that the server
    // implements a mutation type named ‘likeStory’.
    getMutation() {
        return Relay.QL`mutation { createCommentFromCommunityItem }`;
    }

    // Use this method to prepare the variables that will be used as
    // input to the mutation. Our ‘likeStory’ mutation takes exactly
    // one variable as input – the ID of the story to like.
    getVariables() {
        return {
            bodyData: this.props.bodyData,
            communityItem: this.props.communityItem,
        };
    }

    // Use this method to design a ‘fat query’ – one that represents every
    // field in your data model that could change as a result of this mutation.
    // Liking a story could affect the likers count, the sentence that
    // summarizes who has liked a story, and the fact that the viewer likes the
    // story or not. Relay will intersect this query with a ‘tracked query’
    // that represents the data that your application actually uses, and
    // instruct the server to include only those fields in its response.
    getFatQuery() {
        return Relay.QL `
            fragment on CreateCommentFromCommunityItemPayload {
                communityItem {
                    comments
                }
            }
        `;
    }

    // These configurations advise Relay on how to handle the LikeStoryPayload
    // returned by the server. Here, we tell Relay to use the payload to
    // change the fields of a record it already has in the store. The
    // key-value pairs of ‘fieldIDs’ associate field names in the payload
    // with the ID of the record that we want updated.
    getConfigs() {
        return [{
            type: 'FIELDS_CHANGE',
            fieldIDs: {
                communityItem: this.props.communityItem.id
            }
        }];
    }

    // This mutation has a hard dependency on the story's ID. We specify this
    // dependency declaratively here as a GraphQL query fragment. Relay will
    // use this fragment to ensure that the story's ID is available wherever
    // this mutation is used.
    static fragments = {
        communityItem: () => Relay.QL`
            fragment on CommunityItem {
                id
            }
        `,
    };
}
