import promisify from 'pz-support/src/promisify';
import * as graphqlRelay from 'graphql-relay';
import * as graphql from 'graphql';
import {IAppRepositoryAuthorizers} from 'pz-server/src/app/repositories';
import {IRepositoryRecord} from 'pz-server/src/support/repository';

import {initializeTypes}  from 'pz-server/src/graphql/types';

import {
    ICursorResults,
    TBiCursor, IBackwardCursor, IForwardCursor
} from 'pz-server/src/support/cursors/cursors';
import {
    topicAttributeTypeResolver,
    topicAttributeIdResolver
} from '../topics/topic-attributes/topic-attributes-graphql';

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


    const idResolver = (globalId, {user}) => {
        const {type, id} = graphqlRelay.fromGlobalId(globalId);

        if (type === 'Viewer') {
            return { id: 'viewer' };
        }

        if (type === 'OtherUser') {
            return usersAuthorizer.as(user).findOtherUserById(id);
        }

        let repositoryAuthorizer;

        switch (type) {
            case 'User':
                repositoryAuthorizer = usersAuthorizer;
                break;

            case 'Topic':
                repositoryAuthorizer = topicsAuthorizer;
                break;

            case 'CommunityItem':
                repositoryAuthorizer = communityItemsAuthorizer;
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

        return null;
    };

    const typeResolver = (repositoryRecord: IRepositoryRecord) => {
        switch (repositoryRecord.recordType) {
            case 'Viewer':
                return types.ViewerType;

            case 'User':
                return types.UserType;

            case 'Topic':
                return types.TopicType;

            case 'CommunityItem':
                return types.CommunityItemType;

            case 'Comment':
                return types.CommentType;
        }

        const topicAttributeType = topicAttributeTypeResolver(types, repositoryRecord);
        if (topicAttributeType) {
            return topicAttributeType;
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
                    type: types.UserType,
                    resolve: (_, __, {user}) => {
                        return usersAuthorizer.as(user).findCurrentUser();
                    }
                },

                topic: {
                    type: types.TopicType,
                    args: {
                        urlSlug: {
                            type: GraphQLString
                        }
                    },
                    resolve: async (_, {urlSlug}, {user}) => {
                        const topics = topicsAuthorizer.as(user);

                        const topic = await topics.findByUrlSlugName(urlSlug);
                        return topic;
                    }
                }
            })
        }),

        mutation: new GraphQLObjectType({
            name: 'Mutation',

            fields: {
                createCommunityItem: types.CreateCommunityItemMutation,
                createCommunityItemFromTopic: types.CreateCommunityItemFromTopicMutation,

                createCommunityItemVote: types.CreateCommunityItemVoteMutation,
                deleteCommunityItemVote: types.DeleteCommunityItemVoteMutation,
                updateCommunityItemVote: types.UpdateCommunityItemVoteMutation,

                createCommentFromCommunityItem: types.CreateCommentFromCommunityItemMutation
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
