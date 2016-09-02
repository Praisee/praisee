import {IVote} from 'pz-server/src/votes/votes';
import {IAppRepositoryAuthorizers} from 'pz-server/src/app/repositories';
import {AuthorizationError} from 'pz-server/src/support/authorization';
import VoteTypes from 'pz-server/src/votes/votes-graphql';
import * as graphqlRelay from 'graphql-relay';
import * as graphql from 'graphql';

import {
    connectionFromCursorResults,
    biCursorFromGraphqlArgs
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
    const commentsAuthorizer = repositoryAuthorizers.comments;
    const topicsAuthorizer = repositoryAuthorizers.topics;
    const communityItemsAuthorizer = repositoryAuthorizers.communityItems;

    const ViewerType = new GraphQLObjectType({
        name: 'Viewer',

        fields: () => ({

            id: globalIdField('Viewer'),

            topics: {
                type: new GraphQLList(types.TopicType),
                resolve: (_, __, {user}) => topicsAuthorizer.as(user).findAll()
            },

            myCommunityItems: {
                type: types.CommunityItemConnection.connectionType,
                args: connectionArgs,

                resolve: async (_, args, {user}) => {
                    const cursor = biCursorFromGraphqlArgs(args);

                    return connectionFromCursorResults(
                        await communityItemsAuthorizer
                            .as(user)
                            .findSomeByCurrentUser(cursor)
                    );
                }
            }
        })
    });

    return {
        ViewerType
    };
}
