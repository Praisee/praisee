import promisify from 'pz-support/src/promisify';
import * as graphqlRelay from 'graphql-relay';
import * as graphql from 'graphql';
import {IAppRepositoryAuthorizers} from 'pz-server/src/app/repositories';
import {IRepositoryRecord} from 'pz-server/src/support/repository';

import {initializeTypes} from 'pz-server/src/graphql/types';

import {
    topicAttributeTypeResolver,
    topicAttributeIdResolver
} from 'pz-server/src/topics/topic-attributes/topic-attributes-graphql';

import {
    communityItemIdResolver,
    communityItemTypeResolver
} from 'pz-server/src/community-items/community-items-graphql';

import {
    getTopicLookupField
} from 'pz-server/src/topics/topics-graphql';

import {getViewer} from 'pz-server/src/graphql/viewer-graphql';

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

var {isType: isGraphqlType} = require('graphql/type');

export default function createSchema(repositoryAuthorizers: IAppRepositoryAuthorizers) {
    const {
        users: usersAuthorizer,
        topics: topicsAuthorizer,
        communityItems: communityItemsAuthorizer,
        comments: commentsAuthorizer,
        votes: votesAuthorizer
    } = repositoryAuthorizers;


    const idResolver = async (globalId, {user}): Promise<IRepositoryRecord> => {
        const {type, id} = graphqlRelay.fromGlobalId(globalId);

        if (type === 'Viewer') {
            return getViewer();
        }

        if (type === 'OtherUser' || type === 'CurrentUser') {
            return usersAuthorizer.as(user).findUserById(id);
        }

        let repositoryAuthorizer;

        switch (type) {
            case 'User':
                repositoryAuthorizer = usersAuthorizer;
                break;

            case 'Topic':
                repositoryAuthorizer = topicsAuthorizer;
                break;

            case 'Comment':
                repositoryAuthorizer = commentsAuthorizer;
                break;
        }

        if (repositoryAuthorizer) {
            return repositoryAuthorizer.as(user).findById(id);
        }

        const topicAttribute = topicAttributeIdResolver(repositoryAuthorizers, type, id, user);
        if (topicAttribute) {
            return topicAttribute;
        }

        const communityItem = communityItemIdResolver(repositoryAuthorizers, type, id, user);
        if (communityItem) {
            return communityItem;
        }

        return null;
    };

    const typeResolver = (repositoryRecord: IRepositoryRecord) => {
        switch (repositoryRecord.recordType) {
            case 'Viewer':
                return types.ViewerType;

            case 'CurrentUser':
                return types.CurrentUserType;

            case 'OtherUser':
                return types.OtherUserType;

            case 'Topic':
                return types.TopicType;

            case 'Comment':
                return types.CommentType;
        }

        const topicAttributeType = topicAttributeTypeResolver(types, repositoryRecord);
        if (topicAttributeType) {
            return topicAttributeType;
        }

        const communityItemType = communityItemTypeResolver(types, repositoryRecord);
        if (communityItemType) {
            return communityItemType;
        }

        return null;
    };

    const {nodeInterface, nodeField} = nodeDefinitions(
        idResolver, typeResolver
    );

    const types = initializeTypes(repositoryAuthorizers, nodeInterface);
    const typesArray = reduceTypesToArray(types);

    return new GraphQLSchema({
        query: new GraphQLObjectType({
            name: 'Query',

            fields: () => ({
                node: nodeField,

                // Viewer must be at the query root due to a limitation in Relay's design
                // See https://github.com/facebook/relay/issues/112
                viewer: {
                    type: types.ViewerType,
                    resolve: () => ({ id: 'viewer' })
                },

                currentUser: {
                    type: types.CurrentUserType,
                    resolve: async (_, __, {contextUser}) => {
                        let user: any = await usersAuthorizer.as(contextUser).findCurrentUser();
                        if (!user)
                            user = {};
                        user.id = types.CurrentUserType.name;
                        return user;
                    }
                },

                topic: getTopicLookupField(repositoryAuthorizers, types),

                communityItem: {
                    type: types.CommunityItemInterfaceType,

                    args: {
                        id: {
                            type: GraphQLID
                        },

                        urlSlug: {
                            type: GraphQLString
                        }
                    },

                    resolve: async (_, {id: rawId, urlSlug}, {user}) => {
                        let communityItem = null;

                        if (rawId) {
                            const {id} = fromGlobalId(rawId);

                            communityItem = await communityItemsAuthorizer
                                .as(user)
                                .findById(id);

                        } else if (urlSlug) {

                            communityItem = await communityItemsAuthorizer
                                .as(user)
                                .findByUrlSlugName(urlSlug);
                        }

                        return communityItem;
                    }
                }
            })
        }),

        mutation: new GraphQLObjectType({
            name: 'Mutation',

            fields: {
                createCommunityItem: types.CreateCommunityItemMutation,
                updateCommunityItemContent: types.UpdateCommunityItemContentMutation,
                updateCommunityItemType: types.UpdateCommunityItemTypeMutation,
                destroyCommunityItem: types.DestroyCommunityItemMutation,
                updateCommunityItemInteraction: types.UpdateCommunityItemInteractionMutation,

                updateReviewDetails: types.UpdateReviewDetailsMutation,

                createComment: types.CreateCommentMutation,
                updateComment: types.UpdateCommentMutation,

                createVote: types.CreateVoteMutation,
                updateVote: types.UpdateVoteMutation,
                deleteVote: types.DeleteVoteMutation,

                toggleTrust: types.ToggleTrustMutation,
                getCurrentUser: types.GetCurrentUserMutation
            }
        }),

        // By default, GraphQL crawls the entire schema to find types, but if any
        // types are not on the schema, they will not be available to use.
        // This is specifically an issue for interfaces because GraphQL will not
        // know all the implementations of an interface unless they're used in the
        // schema or explicitly defined here.
        types: typesArray
    });
}

function reduceTypesToArray(types) {
    return Object.keys(types).reduce((typesArray, key) => {
        if (isGraphqlType(types[key])) {
            typesArray.push(types[key]);
            return typesArray;
        } else {
            return [...typesArray, ...reduceTypesToArray(types[key])];
        }

    }, []);
}
