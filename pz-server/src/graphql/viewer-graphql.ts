import {IVote} from 'pz-server/src/votes/votes';
import {IAppRepositoryAuthorizers} from 'pz-server/src/app/repositories';
import {AuthorizationError} from 'pz-server/src/support/authorization';
import VoteTypes from 'pz-server/src/votes/votes-graphql';
import * as graphqlRelay from 'graphql-relay';
import * as graphql from 'graphql';
import {
    ICursorResults,
    TBiCursor, IBackwardCursor, IForwardCursor
} from 'pz-server/src/support/cursors/cursors';

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

    const BiCursorFromGraphqlArgs = (graphqlArgs): TBiCursor => {
        const take = graphqlArgs.first || graphqlArgs.last || 10;

        if (graphqlArgs.last) {
            let cursor: IBackwardCursor = {
                takeLast: take
            };

            if (graphqlArgs.before) {
                cursor.skipBefore = graphqlArgs.before;
            }

            return cursor;

        } else {
            let cursor: IForwardCursor = {
                takeFirst: take
            };

            if (graphqlArgs.after) {
                cursor.skipAfter = graphqlArgs.after;
            }

            return cursor;
        }
    };

    const connectionFromCursorResults = <T>(cursorResults: ICursorResults<T>) => {
        let pageInfo: any = {
            hasNextPage: cursorResults.hasNextPage || false,
            hasPreviousPage: cursorResults.hasPreviousPage || false
        };

        return {
            edges: cursorResults.results.map(result => {
                return {
                    cursor: result.cursor,
                    node: result.item
                };
            }),

            pageInfo
        };
    };

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
                    const cursor = BiCursorFromGraphqlArgs(args);

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