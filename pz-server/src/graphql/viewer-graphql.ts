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

import {ITypes} from 'pz-server/src/graphql/types';
import {getStaticPhotosField} from 'pz-server/src/photos/static-photos-graphql';
import {getTopicLookupField} from 'pz-server/src/topics/topics-graphql';

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

export default function getViewerType(repositoryAuthorizers: IAppRepositoryAuthorizers, nodeInterface, types) {
    const commentsAuthorizer = repositoryAuthorizers.comments;
    const topicsAuthorizer = repositoryAuthorizers.topics;
    const communityItemsAuthorizer = repositoryAuthorizers.communityItems;

    const ViewerType = new GraphQLObjectType({
        name: 'Viewer',

        fields: () => ({

            id: globalIdField('Viewer'),

            topic: getTopicLookupField(repositoryAuthorizers, types),

            topics: {
                type: new GraphQLList(types.TopicType),
                resolve: (_, __, {user}) => topicsAuthorizer.as(user).findAll()
            },

            myCommunityItems: {
                type: types.CommunityItemConnection.connectionType,
                args: connectionArgs,

                resolve: async (_, args, {user}) => {
                    const cursor = biCursorFromGraphqlArgs(args as any);

                    return connectionFromCursorResults(
                        await communityItemsAuthorizer
                            .as(user)
                            .findSomeByCurrentUser(cursor)
                    );
                }
            },

            lastCreatedCommunityItem: {
                type: types.CommunityItemInterfaceType
            },

            staticPhotos: getStaticPhotosField(types),

            responseErrorsList: {
                type: new GraphQLList(types.ResponseErrorInterfaceType),
                resolve: (_, __, {responseErrors}) => {
                    return responseErrors;
                }
            }
        }),

        interfaces: [nodeInterface]
    });

    return {
        ViewerType
    };
}

export function getViewer() {
    return {
        recordType: 'Viewer',
        id: 'viewer'
    };
}

export function getViewerField(types: ITypes, viewerResolver?: Function) {
    return {
        type: new GraphQLNonNull(types.ViewerType),
        resolve: (...args) => {
            const viewer = getViewer();

            if (viewerResolver) {
                return Object.assign(viewer, viewerResolver(...args));
            } else {
                return viewer;
            }
        }
    };
}
