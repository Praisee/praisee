import {
    GraphQLBoolean,
    GraphQLID,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLInputObjectType,
    GraphQLSchema,
    GraphQLString,
    GraphQLInterfaceType
} from 'graphql';

import {
    connectionDefinitions,
    fromGlobalId,
    nodeDefinitions,
    connectionArgs,
    globalId,
    connectionFromArray,
    connectionFromPromisedArray,
    globalIdField,
    mutationWithClientMutationId
} from 'graphql-relay';

import {IAppRepositoryAuthorizers} from 'pz-server/src/app/repositories';
import {AuthorizationError} from 'pz-server/src/support/authorization';
import {ITypes} from 'pz-server/src/graphql/types';
import {IVote} from 'pz-server/src/votes/votes';
import {parseInputContentData} from 'pz-server/src/content/input-content-data';
import {getReviewFields, getReviewMutationTypes} from './reviews/reviews-graphql';
import {TCommunityItemType, ICommunityItem} from './community-items';

export default function getCommunityItemTypes(repositoryAuthorizers: IAppRepositoryAuthorizers, nodeInterface, types: ITypes) {
    const communityItemsAuthorizer = repositoryAuthorizers.communityItems;
    const commentsAuthorizer = repositoryAuthorizers.comments;
    const usersAuthorizer = repositoryAuthorizers.users;
    const votesAuthorizer = repositoryAuthorizers.votes;
    const vanityRoutePathAuthorizer = repositoryAuthorizers.vanityRoutePaths;

    var communityItemFields = () => ({
        id: globalIdField('CommunityItem'),

        type: {
            type: new GraphQLNonNull(GraphQLString)
        },

        summary: {
            type: new GraphQLNonNull(GraphQLString)
        },

        body: {
            type: GraphQLString
        },

        bodyData: {
            type: GraphQLString,
            resolve: (source) => JSON.stringify(source.bodyData)
        },

        createdAt: {
            type: new GraphQLNonNull(GraphQLString)
        },

        udpdatedAt: {
            type: new GraphQLNonNull(GraphQLString)
        },

        user: {
            type: types.UserInterfaceType,
            resolve: async (communityItem, _, {user: currentUser}) => {
                const user = await usersAuthorizer
                    .as(currentUser)
                    .findUserById(communityItem.userId)

                return user;
            }
        },

        commentCount: {
            type: GraphQLInt,
            resolve: async (communityItem, _, {user}) => {
                const count = await commentsAuthorizer
                    .as(user)
                    .getCountForRootParent("CommunityItem", communityItem.id);

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

        routePath: {
            type: GraphQLString,
            resolve: async (communityItem, _, {user}) => {
                let route = await vanityRoutePathAuthorizer.as(user).findByRecord(communityItem);
                return route.routePath;
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
    });

    var CommunityItemInterfaceType = new GraphQLInterfaceType({
        name: 'CommunityItemInterface',

        fields: communityItemFields,

        resolveType: (communityItem: ICommunityItem) => {
            switch (communityItem.type) {
                case 'Review':
                    return ReviewCommunityItemType;

                case 'General':
                default:
                    return GeneralCommunityItemType;
            }
        }
    });

    function  createCommunityItemType(communityItemType: TCommunityItemType, additionalFields: any = null) {
        return new GraphQLObjectType({
            name: communityItemType + 'CommunityItem',

            fields: () => {
                let resolvedAdditionalFields = {};

                if (additionalFields) {
                    if (typeof additionalFields === 'function'
                        || additionalFields instanceof Function) {

                        // additionalFields is a thunk
                        resolvedAdditionalFields = additionalFields();

                    } else {

                        resolvedAdditionalFields = additionalFields;
                    }
                }

                return Object.assign(
                    communityItemFields(),
                    resolvedAdditionalFields
                );
            },

            interfaces: [nodeInterface, CommunityItemInterfaceType]
        });
    }

    var GeneralCommunityItemType = createCommunityItemType('General');

    var ReviewCommunityItemType = createCommunityItemType(
        'Review', getReviewFields(repositoryAuthorizers, types)
    );

    var CommunityItemConnection = connectionDefinitions({
        name: 'CommunityItem',
        nodeType: CommunityItemInterfaceType
    });

    var CreateCommunityItemMutation = mutationWithClientMutationId({
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

    var CreateCommunityItemFromTopicMutation = mutationWithClientMutationId({
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
                type: types.CommunityItemInterfaceType,
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

    return Object.assign({},
        getReviewMutationTypes(repositoryAuthorizers, types),

        {
            CommunityItemInterfaceType,

            communityItemTypes: {
                general: GeneralCommunityItemType,
                review: ReviewCommunityItemType,
            },

            CommunityItemConnection,

            CreateCommunityItemMutation,
            CreateCommunityItemFromTopicMutation,
        }
    );
}

export function communityItemIdResolver(repositoryAuthorizers: IAppRepositoryAuthorizers, type, id, user) {
    if (type.endsWith('CommunityItem')) {
        return repositoryAuthorizers.communityItems.as(user).findById(id);
    }
}

export function communityItemTypeResolver(types: ITypes, source) {
    if (!source || source.recordType !== 'CommunityItem') {
        return null;
    }

    switch (source.type) {
        case 'Review':
            return types.communityItemTypes.review;

        case 'General':
        default:
            return types.communityItemTypes.general;
    }
}
