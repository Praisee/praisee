import * as Relay from 'react-relay';

export default class CreateCommunityItemFromTopicMutation extends Relay.Mutation {
    // This method should return a GraphQL operation that represents
    // the mutation to be performed. This presumes that the server
    // implements a mutation type named ‘likeStory’.
    getMutation() {
        return Relay.QL`mutation { createCommunityItemFromTopic }`;
    }

    // Use this method to prepare the variables that will be used as
    // input to the mutation. Our ‘likeStory’ mutation takes exactly
    // one variable as input – the ID of the story to like.
    getVariables() {
        let vars = {
            type: this.props.type,
            summary: this.props.summary,
            bodyData: this.props.bodyData,
            topicId: this.props.topic.id,
            reviewDetails: null
        };

        if (this.props.type === 'Review') {
            // TODO: This is a hack, community item types should have their own dedicated mutations
            vars.reviewDetails = this.props.reviewDetails
        }

        return vars;
    }

    // Use this method to design a ‘fat query’ – one that represents every
    // field in your data model that could change as a result of this mutation.
    // Liking a story could affect the likers count, the sentence that
    // summarizes who has liked a story, and the fact that the viewer likes the
    // story or not. Relay will intersect this query with a ‘tracked query’
    // that represents the data that your application actually uses, and
    // instruct the server to include only those fields in its response.
    // getFatQuery() {
    //     return Relay.QL`
    //       fragment on LikeStoryPayload {
    //         story {
    //           likers {
    //             count,
    //           },
    //           likeSentence,
    //           viewerDoesLike,
    //         },
    //       }
    //     `;
    // }
    getFatQuery() {
        return Relay.QL `
            fragment on CreateCommunityItemFromTopicPayload {
                topic {
                    id,
                    communityItems
                }
                viewer {
                    lastCreatedCommunityItem {
                        routePath
                    }
                }
            }
        `;
    }

    // These configurations advise Relay on how to handle the LikeStoryPayload
    // returned by the server. Here, we tell Relay to use the payload to
    // change the fields of a record it already has in the store. The
    // key-value pairs of ‘fieldIDs’ associate field names in the payload
    // with the ID of the record that we want updated.
    // getConfigs() {
    //     return [{
    //         type: 'FIELDS_CHANGE',
    //         fieldIDs: {
    //             story: this.props.story.id,
    //         },
    //     }];
    // }
    getConfigs() {
        return [{
            type: 'FIELDS_CHANGE',
            fieldIDs: {
                topic: this.props.topic.id,
                viewer: this.props.viewer.id
            }
        }];
    }

    // This mutation has a hard dependency on the story's ID. We specify this
    // dependency declaratively here as a GraphQL query fragment. Relay will
    // use this fragment to ensure that the story's ID is available wherever
    // this mutation is used.
    // static fragments = {
    //     story: () => Relay.QL`
    //       fragment on Story {
    //         id,
    //       }
    //     `,
    // };
    static fragments = {
        topic: () => Relay.QL`
            fragment on Topic {
                id
            }
        `,
        viewer: () => Relay.QL`
            fragment on Viewer {
                id
            }
        `,
    };
}
