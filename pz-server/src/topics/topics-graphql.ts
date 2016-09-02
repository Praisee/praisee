import {IAppRepositoryAuthorizers} from 'pz-server/src/app/repositories';
import * as graphqlRelay from 'graphql-relay';
import * as graphql from 'graphql';
import {
    biCursorFromGraphqlArgs,
    connectionFromCursorResults
} from 'pz-server/src/graphql/cursor-helpers';

var {
    GraphQLBoolean,
    GraphQLID,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLInputObjectType,
    GraphQLSchema,
    GraphQLString
} = graphql;

var {
    connectionDefinitions,
    fromGlobalId,
    nodeDefinitions,
    connectionArgs,
    globalId,
    connectionFromArray,
    connectionFromPromisedArray,
    globalIdField,
    mutationWithClientMutationId
} = graphqlRelay;

export default function CommentTypes(repositoryAuthorizers: IAppRepositoryAuthorizers, nodeInterface, types) {
    const topicsAuthorizer = repositoryAuthorizers.topics;
    const vanityRoutePathAuthorizer = repositoryAuthorizers.vanityRoutePaths;

    const TopicType = new GraphQLObjectType({
        name: 'Topic',

        fields: () => {
            return ({
                id: globalIdField('Topic'),

                name: {
                    type: GraphQLString
                },

                description: {
                    type: GraphQLString
                },

                thumbnailPath: {
                    type: GraphQLString
                },

                overviewContent: {
                    type: GraphQLString
                },

                isVerified: {
                    type: GraphQLBoolean
                },

                communityItems: {
                    type: types.CommunityItemConnection.connectionType,
                    args: connectionArgs,

                    resolve: async (topic, args, {user}) => {
                        const cursor = biCursorFromGraphqlArgs(args);

                        const communityItems = await topicsAuthorizer
                            .as(user)
                            .findSomeCommunityItemsRanked(topic.id, cursor);

                        return connectionFromCursorResults(communityItems);
                    }
                },

                routePath: {
                    type: GraphQLString,
                    resolve: async (topic, _, {user}) => {
                        let route = await vanityRoutePathAuthorizer.as(user).findByRecord(topic);
                        return route.routePath;
                    }
                }
            });
        },

        interfaces: [nodeInterface]
    });

    return {
        TopicType
    };
}
