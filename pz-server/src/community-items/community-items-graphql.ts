import {IAppRepositoryAuthorizers} from 'pz-server/src/app/repositories';
import {AuthorizationError} from 'pz-server/src/support/authorization';
import {ITypes} from 'pz-server/src/graphql/types';
import * as graphqlRelay from 'graphql-relay';
import * as graphql from 'graphql';
import {IVote} from 'pz-server/src/votes/votes';
import convertTextToData from 'pz-server/src/content/text-to-data-converter';
import {parseInputContentData} from 'pz-server/src/content/input-content-data';

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

export default function CommunityItemTypes(repositoryAuthorizers: IAppRepositoryAuthorizers, nodeInterface, types: ITypes) {
    const communityItemsAuthorizer = repositoryAuthorizers.communityItems;
    const commentsAuthorizer = repositoryAuthorizers.comments;
    const usersAuthorizer = repositoryAuthorizers.users;
    const votesAuthorizer = repositoryAuthorizers.votes;

    const CommunityItemType = new GraphQLObjectType({
        name: 'CommunityItem',

        fields: () => ({
            id: globalIdField('CommunityItem'),

            type: {
                type: new GraphQLNonNull(GraphQLString)
            },

            summary: {
                type: GraphQLString
            },

            body: {
                type: GraphQLString
            },

            bodyData: {
                type: GraphQLString,
                resolve: (source) => JSON.stringify(source.bodyData)
            },

            createdAt: {
                type: GraphQLString
            },

            udpdatedAt: {
                type: GraphQLString
            },

            user: {
                type: types.OtherUserType,
                resolve: async (communityItem, _, {user: currentUser}) => {
                    const user = await usersAuthorizer
                        .as(currentUser)
                        .findOtherUserById(communityItem.userId)

                    return user;
                }
            },

            commentCount: {
                type: GraphQLInt,
                resolve: async (communityItem, _, {user}) => {
                    const count = await commentsAuthorizer
                        .as(user)
                        .getCountForParent("CommunityItem", communityItem.id);

                    return count;
                }
            },

            comments: {
                type: new GraphQLList(types.CommentType),
                resolve: async (communityItem, _, {user}) => {

                    const comments = await communityItemsAuthorizer
                        .as(user)
                        .findAllComments(communityItem.id);

                    return comments;
                }
            },

            topics: {
                type: new GraphQLList(types.TopicType),
                resolve: async (communityItem, _, {user}) => {
                    const topics = await communityItemsAuthorizer
                        .as(user)
                        .findAllTopics(communityItem.id);

                    return topics;
                }
            },

            currentUserVote: {
                type: GraphQLBoolean,
                resolve: async ({id}, __, {user}) => {
                    if (!user) return null;

                    let data = await votesAuthorizer
                        .as(user)
                        .findCurrentUserVoteForParent("CommunityItem", id);

                    if (!data || data instanceof (AuthorizationError))
                        return null;

                    let vote = data as IVote;
                    return vote.isUpVote;
                }
            },

            votes: {
                type: types.VoteAggregateType,
                resolve: async ({id}, _, {user}) => {
                    let aggregate = await votesAuthorizer
                        .as(user)
                        .getAggregateForParent("CommunityItem", id);

                    if (!aggregate || aggregate instanceof (AuthorizationError))
                        return null;

                    return aggregate;
                }
            },
        }),

        interfaces: [nodeInterface]
    });

    const CommunityItemConnection = connectionDefinitions({
        name: "CommunityItem",
        nodeType: CommunityItemType
    });

    const CreateCommunityItemMutation = mutationWithClientMutationId({
        name: 'CreateCommunityItem',

        inputFields: () => ({
            type: { type: new GraphQLNonNull(GraphQLString) },
            summary: { type: new GraphQLNonNull(GraphQLString) },
            body: { type: GraphQLString },
            bodyData: { type: types.InputContentDataType }
        }),

        outputFields: () => ({

            viewer: {
                type: types.ViewerType,
                resolve: () => ({ id: 'viewer' })
            }
        }),

        mutateAndGetPayload: async ({type, summary, body, bodyData}, context) => {
            const parsedBodyData = parseInputContentData(body || bodyData);

            const communityItem = await communityItemsAuthorizer.as(context.user).create({
                recordType: 'CommunityItem',
                type,
                summary,
                bodyData: parsedBodyData
            });

            if (communityItem instanceof AuthorizationError) {
                return { communityItem: null };
            }

            return { communityItem };
        },
    });

    const CreateCommunityItemFromTopicMutation = mutationWithClientMutationId({
        name: 'CreateCommunityItemFromTopic',

        inputFields: () => ({
            type: { type: new GraphQLNonNull(GraphQLString) },
            summary: { type: new GraphQLNonNull(GraphQLString) },
            body: { type: GraphQLString },
            bodyData: { type: types.InputContentDataType },
            topicId: { type: GraphQLString }
        }),

        outputFields: () => ({
            communityItem: {
                type: types.CommunityItemType,
                resolve: ({communityItem}) => {
                    return communityItem;
                }
            },
            topic: {
                type: types.TopicType,
                resolve: () => ({ id: 'topic' })
            },
            viewer: {
                type: types.ViewerType,
                resolve: () => ({ id: 'viewer' })
            }
        }),

        mutateAndGetPayload: async ({type, summary, body, bodyData, topicId}, context) => {
            const parsedBodyData = parseInputContentData(body || bodyData);

            const {id} = fromGlobalId(topicId);
            const communityItem = await communityItemsAuthorizer.as(context.user).create({
                recordType: 'CommunityItem',
                type,
                summary,
                bodyData: parsedBodyData,
                topics: [id]
            });

            if (communityItem instanceof AuthorizationError) {
                return { communityItem: null };
            }

            return { communityItem };
        },
    });


    return {
        CommunityItemType,
        CommunityItemConnection,
        CreateCommunityItemMutation,
        CreateCommunityItemFromTopicMutation
    };
}