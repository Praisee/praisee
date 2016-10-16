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
import {
    AuthorizationError,
    NotAuthenticatedError
} from 'pz-server/src/support/authorization';
import {ITypes} from 'pz-server/src/graphql/types';
import {IVote} from 'pz-server/src/votes/votes';
import {parseInputContentData} from 'pz-server/src/content/input-content-data';
import {
    getReviewFields,
    getReviewMutationTypes,
    ReviewPricePaidCurrencyType
} from 'pz-server/src/community-items/reviews/reviews-graphql';

import {
    TCommunityItemType,
    ICommunityItem,
    ICommunityItemInteraction
} from 'pz-server/src/community-items/community-items';

import {getViewerField} from 'pz-server/src/graphql/viewer-graphql';
import {addErrorToResponse} from 'pz-server/src/errors/errors-graphql';

export default function getCommunityItemTypes(repositoryAuthorizers: IAppRepositoryAuthorizers, nodeInterface, types: ITypes) {
    const communityItemsAuthorizer = repositoryAuthorizers.communityItems;
    const reviewsAuthorizer = repositoryAuthorizers.reviews;
    const topicsAuthorizer = repositoryAuthorizers.topics;
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
                    .findUserById(communityItem.userId);

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
                if (!user) {
                    return null;
                }

                let data = await votesAuthorizer
                    .as(user)
                    .findCurrentUserVoteForParent("CommunityItem", id);

                if (!data || data instanceof (AuthorizationError)) {
                    return null;
                }

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

        currentUserHasMarkedRead: {
            type: new GraphQLNonNull(GraphQLBoolean),

            resolve: async ({id}, __, {user}) => {
                if (!user) {
                    return false;
                }

                let result = await communityItemsAuthorizer
                    .as(user)
                    .findInteraction(id);

                if (!result) {
                    return false;
                }

                return result.hasMarkedRead;
            }
        },
        
        isMine: {
            type: new GraphQLNonNull(GraphQLBoolean),
            
            resolve: async (communityItem, __, {user}) => {
                if (!user) {
                    return false;
                }
                
                return communityItem.userId === user.id;
            }
        },
        
        reputationEarned: {
            type: new GraphQLNonNull(GraphQLInt),
            
            resolve: async (communityItem, __, {user}) => {
                return 125;
            }
        }
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
            bodyData: { type: new GraphQLNonNull(types.InputContentDataType) }
        }),

        outputFields: () => ({
            viewer: getViewerField(types)
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
            bodyData: { type: new GraphQLNonNull(types.InputContentDataType) },
            topicId: { type: new GraphQLNonNull(GraphQLString) },

            // TODO: This is a hack, community item types should have their own dedicated mutations
            reviewDetails: {
                type: new GraphQLInputObjectType({
                    name: 'CreateCommunityItemFromTopicReviewDetails',
                    fields: {
                        reviewedTopicId: {
                            type: new GraphQLNonNull(GraphQLID)
                        },

                        reviewRating: {
                            type: new GraphQLNonNull(GraphQLInt)
                        },

                        reviewPricePaid: {
                            type: GraphQLString
                        },

                        reviewPricePaidCurrency: {
                            type: ReviewPricePaidCurrencyType
                        }
                    }
                })
            }
        }),

        outputFields: () => ({
            topic: {
                type: types.TopicType,
                resolve: ({topicId}, {user}) => {
                    if (!topicId) {
                        return null;
                    }

                    return topicsAuthorizer.as(user).findById(topicId);
                }
            },

            viewer: getViewerField(types, ({communityItem}) => ({
                lastCreatedCommunityItem: communityItem
            }))
        }),

        mutateAndGetPayload: async ({type, summary, body, bodyData, topicId: rawTopicId, reviewDetails}, context) => {
            const parsedBodyData = parseInputContentData(body || bodyData);
            const {id: topicId} = fromGlobalId(rawTopicId);
            const authorizedCommunityItems = communityItemsAuthorizer.as(context.user);

            let communityItem = await authorizedCommunityItems.create({
                recordType: 'CommunityItem',
                type: 'General', // This is updated later when all the details have been verified
                summary,
                bodyData: parsedBodyData,
                topics: [topicId]
            });

            if (communityItem instanceof AuthorizationError) {
                if (communityItem instanceof NotAuthenticatedError) {
                    addErrorToResponse(context.responseErrors, 'NotAuthenticated', communityItem);
                }

                return {};
            }

            // TODO: This is a hack, community item types should have their own dedicated mutations
            if (type === 'Review' && reviewDetails) {
                const {id: reviewedTopicId} = fromGlobalId(reviewDetails.reviewedTopicId);

                communityItem = await reviewsAuthorizer
                    .as(context.user)
                    .updateReviewDetails(
                        communityItem.id,
                        Object.assign({}, reviewDetails, {reviewedTopicId})
                    );

            } else if (type === 'Question') {
                communityItem = await authorizedCommunityItems
                    .update(Object.assign({}, communityItem, {
                        type: 'Question'
                    }));
            }

            if (communityItem instanceof AuthorizationError) {
                return {};
            }

            return { communityItem, topicId };
        },
    });

    var UpdateCommunityItemInteractionMutation = mutationWithClientMutationId({
        name: 'UpdateCommunityItemInteraction',

        inputFields: () => ({
            communityItemId: { type: new GraphQLNonNull(GraphQLID) },
            hasMarkedRead: { type: GraphQLBoolean }
        }),

        outputFields: () => ({
            viewer: getViewerField(types)
        }),

        mutateAndGetPayload: async (input, {user, responseErrors}) => {
            // For now, this is only marking things as read

            const {hasMarkedRead} = input;

            if (hasMarkedRead !== true && hasMarkedRead !== false) {
                return {};
            }

            const {id: communityItemId} = fromGlobalId(input.communityItemId);

            const interaction: ICommunityItemInteraction = {
                recordType: 'CommunityItemInteraction',
                communityItemId,
                hasMarkedRead
            };

            const result = await communityItemsAuthorizer
                .as(user)
                .updateInteraction(interaction);

            if (result instanceof NotAuthenticatedError) {
                addErrorToResponse(responseErrors, 'NotAuthenticated', result);
            }

            return {communityItemInteraction: result};
        }
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
            UpdateCommunityItemInteractionMutation
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
