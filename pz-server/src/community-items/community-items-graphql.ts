import {
    GraphQLBoolean,
    GraphQLID,
    GraphQLInt,
    GraphQLFloat,
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
    NotAuthenticatedError, NotOwnerError
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

import {GraphQLUnionType} from 'graphql/type/definition';

import {
    biCursorFromGraphqlArgs,
    connectionFromCursorResults
} from 'pz-server/src/graphql/cursor-helpers';

import {mapCursorResultItems} from 'pz-server/src/support/cursors/map-cursor-results';
import {getCommunityItemContentPhotoVariationsUrls} from 'pz-server/src/photos/photo-variations';

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
            resolve: async (communityItem: ICommunityItem, _, {user: currentUser}) => {
                const user = await usersAuthorizer
                    .as(currentUser)
                    .findUserById(communityItem.userId);

                return user;
            }
        },

        commentCount: {
            type: GraphQLInt,
            resolve: async (communityItem: ICommunityItem, _, {user}) => {
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
            resolve: async (communityItem: ICommunityItem, _, {user}) => {
                const topics = await communityItemsAuthorizer
                    .as(user)
                    .findAllTopics(communityItem.id);

                return topics;
            }
        },

        routePath: {
            type: GraphQLString,
            resolve: async (communityItem: ICommunityItem, _, {user}) => {
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

        belongsToCurrentUser: {
            type: new GraphQLNonNull(GraphQLBoolean),

            resolve: async ({userId}, __, {user}) => {
                if (!user) {
                    return false;
                }

                return user.id === userId;
            }
        },

        reputationEarned: {
            type: GraphQLInt,

            resolve: async (communityItem: ICommunityItem, __, {user}) => {
                return communityItemsAuthorizer
                    .as(user)
                    .getReputationEarned(communityItem.id);
            }
        },

        photos: {
            type: CommunityItemPhotoConnection.connectionType,
            args: connectionArgs,

            resolve: async (communityItem, args, {user}) => {
                const cursor = biCursorFromGraphqlArgs(args as any);

                const photoGalleryPhotos = await communityItemsAuthorizer
                    .as(user)
                    .findSomePhotosById(communityItem.id, cursor);

                const photoGalleryPhotosUrls = mapCursorResultItems(photoGalleryPhotos, (photo) => {
                    return Object.assign({}, photo,
                        getCommunityItemContentPhotoVariationsUrls(photo.photoServerPath)
                    );
                });

                return connectionFromCursorResults(photoGalleryPhotosUrls);
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

    function createCommunityItemType(communityItemType: TCommunityItemType, additionalFields: any = null) {
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

    const CommunityItemPhotoType = new GraphQLObjectType({
        name: 'CommunityItemPhoto',

        fields: () => ({
            defaultUrl: {type: new GraphQLNonNull(GraphQLString)},

            variations: {
                type: new GraphQLObjectType({
                    name: 'CommunityItemPhotoVariations',

                    fields: {
                        initialLoad: {type: new GraphQLNonNull(GraphQLString)},
                        mobile: {type: new GraphQLNonNull(GraphQLString)}
                    }
                })
            }
        })
    });

    const CommunityItemPhotoConnection = connectionDefinitions({
        name: 'CommunityItemPhoto',
        nodeType: CommunityItemPhotoType
    });

    var CreateCommunityItemMutation = mutationWithClientMutationId({
        name: 'CreateCommunityItem',

        inputFields: () => ({
            type: { type: new GraphQLNonNull(GraphQLString) },
            summary: { type: new GraphQLNonNull(GraphQLString) },
            body: { type: GraphQLString },
            bodyData: { type: new GraphQLNonNull(types.InputContentDataType) },
            topicIds: { type: new GraphQLList(GraphQLID) },
            newTopics: { type: new GraphQLList(GraphQLString) },

            // TODO: This is a hack, community item types should have their own dedicated mutations
            reviewDetails: {
                type: new GraphQLInputObjectType({
                    name: 'CreateCommunityItemReviewDetails',
                    fields: {
                        reviewedTopicId: {
                            type: GraphQLID
                        },

                        newReviewedTopic: {
                            type: GraphQLString
                        },

                        reviewRating: {
                            type: new GraphQLNonNull(GraphQLFloat)
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
            // topic: {
            //     type: types.TopicType,
            //     resolve: ({topicId}, {user}) => {
            //         if (!topicId) {
            //             return null;
            //         }
            //
            //         return topicsAuthorizer.as(user).findById(topicId);
            //     }
            // },

            viewer: getViewerField(types, ({communityItem}) => ({
                lastCreatedCommunityItem: communityItem
            }))
        }),

        mutateAndGetPayload: async (payload, context) => {
            const {
                type,
                summary,
                body,
                bodyData,
                topicIds: rawTopicIds,
                newTopics: newTopicNames,
                reviewDetails
            } = payload;

            const authorizedCommunityItems = communityItemsAuthorizer.as(context.user);
            const authorizedTopics = topicsAuthorizer.as(context.user);

            const parsedBodyData = parseInputContentData(body || bodyData);

            let topicIds: Array<number> = rawTopicIds ? rawTopicIds.map((rawTopicId) => {
                const {id: topicId} = fromGlobalId(rawTopicId);
                return topicId;
            }) : [];

            const newTopics = await authorizedTopics.createAllByNames(newTopicNames || []);
            const newTopicIds: Array<number> = newTopics.map(newTopic => newTopic.id);

            let reviewedTopicId;

            // TODO: This is a hack, community item types should have their own dedicated mutations
            // TODO: Also, this code is utter shit and needs to be cleaned up
            if (type === 'Review' && reviewDetails) {
                // We have to put this code up here to be able to push the reviewed
                // topic onto the list of associated topics. It's hacky and needs to
                // be reworked in the future.

                if (reviewDetails.reviewedTopicId) {
                    let parsedId = fromGlobalId(reviewDetails.reviewedTopicId);
                    reviewedTopicId = parsedId.id;

                } else if (reviewDetails.newReviewedTopic) {

                    const [newTopic] = await authorizedTopics.createAllByNames([
                        reviewDetails.newReviewedTopic
                    ]);

                    reviewedTopicId = newTopic.id;
                }

                if (!reviewedTopicId) {
                    throw new Error('No topic available to review');
                }

                topicIds.push(reviewedTopicId);
            }

            const dedupeArray = <T>(array: Array<T>): Array<T> => Array.from(new Set(array));

            let communityItem = await authorizedCommunityItems.create({
                recordType: 'CommunityItem',
                type: 'General', // This is updated later when all the details have been verified
                summary,
                bodyData: parsedBodyData,
                topics: dedupeArray([...topicIds, ...newTopicIds])
            });

            if (communityItem instanceof AuthorizationError) {
                if (communityItem instanceof NotAuthenticatedError) {
                    addErrorToResponse(context.responseErrors, 'NotAuthenticated', communityItem);
                }

                return {};
            }

            // TODO: This is a hack, community item types should have their own dedicated mutations
            if (type === 'Review' && reviewDetails) {
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

            return { communityItem };
        },
    });

    var UpdateCommunityItemContentMutation = mutationWithClientMutationId({
        name: 'UpdateCommunityItemContent',

        inputFields: () => ({
            id: { type: new GraphQLNonNull(GraphQLID) },
            summary: { type: new GraphQLNonNull(GraphQLString) },
            body: { type: GraphQLString },
            bodyData: { type: new GraphQLNonNull(types.InputContentDataType) },
        }),

        outputFields: () => ({
            communityItem: {
                type: types.CommunityItemInterfaceType,
                resolve: ({communityItem}) => communityItem
            },

            viewer: getViewerField(types, ({communityItem}) => ({
                lastCreatedCommunityItem: communityItem
            }))
        }),

        mutateAndGetPayload: async ({id: rawId, summary, body, bodyData}, context) => {
            const {id} = fromGlobalId(rawId);

            const parsedBodyData = parseInputContentData(body || bodyData);
            const authorizedCommunityItems = communityItemsAuthorizer.as(context.user);

            const oldCommunityItem = await authorizedCommunityItems.findById(id);

            if (!oldCommunityItem) {
                addErrorToResponse(context.responseErrors, 'NotFound', new Error('Community item was not found'));
                return {};
            }

            let updatedCommunityItem = await authorizedCommunityItems.update(Object.assign(
                {}, oldCommunityItem, {
                    recordType: 'CommunityItem',
                    id,
                    summary,
                    bodyData: parsedBodyData
                }
            ));

            if (updatedCommunityItem instanceof AuthorizationError) {
                if (updatedCommunityItem instanceof NotAuthenticatedError) {
                    addErrorToResponse(context.responseErrors, 'NotAuthenticated', updatedCommunityItem);
                } else if (updatedCommunityItem instanceof NotOwnerError) {
                    addErrorToResponse(context.responseErrors, 'NotOwnerError', updatedCommunityItem);
                }

                return {};
            }

            return { communityItem: updatedCommunityItem };
        },
    });

    var UpdateCommunityItemTypeMutation = mutationWithClientMutationId({
        name: 'UpdateCommunityItemType',

        inputFields: () => ({
            id: { type: new GraphQLNonNull(GraphQLID) },
            type: { type: new GraphQLNonNull(GraphQLString) },
        }),

        outputFields: () => ({
            communityItem: {
                type: types.CommunityItemInterfaceType,
                resolve: ({communityItem}) => communityItem
            },

            viewer: getViewerField(types, ({communityItem}) => ({
                lastCreatedCommunityItem: communityItem
            }))
        }),

        mutateAndGetPayload: async ({id: rawId, type}, context) => {
            if (type !== 'General' && type !== 'Question') {
                addErrorToResponse(context.responseErrors, 'BadRequest',
                    new Error('Only general and question community item types are accepted for this mutation'));
                return {};
            }

            const authorizedCommunityItems = communityItemsAuthorizer.as(context.user);

            const {id} = fromGlobalId(rawId);
            const oldCommunityItem = await authorizedCommunityItems.findById(id);

            if (!oldCommunityItem) {
                addErrorToResponse(context.responseErrors, 'NotFound', new Error('Community item was not found'));
                return {};
            }

            let updatedCommunityItem = await authorizedCommunityItems.update(Object.assign(
                {}, oldCommunityItem, {
                    recordType: 'CommunityItem',
                    id,
                    type
                }
            ));

            if (updatedCommunityItem instanceof AuthorizationError) {
                if (updatedCommunityItem instanceof NotAuthenticatedError) {
                    addErrorToResponse(context.responseErrors, 'NotAuthenticated', updatedCommunityItem);
                } else if (updatedCommunityItem instanceof NotOwnerError) {
                    addErrorToResponse(context.responseErrors, 'NotOwnerError', updatedCommunityItem);
                }

                return {};
            }

            return { communityItem: updatedCommunityItem };
        },
    });

    var DestroyCommunityItemMutation = mutationWithClientMutationId({
        name: 'DestroyCommunityItem',

        inputFields: () => ({
            id: { type: new GraphQLNonNull(GraphQLID) }
        }),

        outputFields: () => ({
            viewer: getViewerField(types)
        }),

        mutateAndGetPayload: async ({id: rawId}, context) => {
            const {id} = fromGlobalId(rawId);

            const authorizedCommunityItems = communityItemsAuthorizer.as(context.user);

            const result = await authorizedCommunityItems.destroy({
                recordType: 'CommunityItem',
                id
            });

            if (result && result instanceof AuthorizationError) {
                if (result instanceof NotAuthenticatedError) {
                    addErrorToResponse(context.responseErrors, 'NotAuthenticated', result);
                } else if (result instanceof NotOwnerError) {
                    addErrorToResponse(context.responseErrors, 'NotOwnerError', result);
                }
            }

            return {};
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

            CommunityItemPhotoType,

            CreateCommunityItemMutation,
            UpdateCommunityItemContentMutation,
            UpdateCommunityItemTypeMutation,
            DestroyCommunityItemMutation,
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
