
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
    GraphQLEnumType
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
import {ITypes} from 'pz-server/src/graphql/types';
import {
    AuthorizationError,
    NotOwnerError, NotAuthenticatedError
} from 'pz-server/src/support/authorization';
import {addErrorToResponse} from 'pz-server/src/errors/errors-graphql';
import {IReview} from 'pz-server/src/community-items/reviews/reviews';

const ReviewPricePaidCurrencyType = new GraphQLEnumType({
    name: 'ReviewPricePaidCurrencyType',

    values: {
        usd: {value: 'usd'}
    }
});

export function getReviewFields(repositoryAuthorizers: IAppRepositoryAuthorizers, types: ITypes) {
    const topicsAuthorizer = repositoryAuthorizers.topics;

    return () => ({
        reviewedTopic: {
            type: new GraphQLNonNull(types.TopicType),

            resolve: async (review: IReview, _, {user}) => {
                if (!review.reviewedTopicId) {
                    throw new Error('Review does not have a reviewed topic: ' + review.id);
                }

                const topic = await topicsAuthorizer
                    .as(user)
                    .findById(review.reviewedTopicId);

                return topic;
            }
        },

        reviewRating: {
            type: GraphQLInt
        },

        reviewPricePaid: {
            type: GraphQLString
        },

        reviewPricePaidCurrency: {
            type: ReviewPricePaidCurrencyType
        }
    });
}

export function getReviewMutationTypes(repositoryAuthorizers: IAppRepositoryAuthorizers, types: ITypes) {
    const reviewsAuthorizer = repositoryAuthorizers.reviews;

    const UpdateReviewDetailsMutation = mutationWithClientMutationId({
        name: 'UpdateReviewDetails',

        inputFields: {
            communityItemId: {
                type: new GraphQLNonNull(GraphQLID)
            },

            reviewedTopicId: {
                type: new GraphQLNonNull(GraphQLID)
            },

            reviewRating: {
                type: GraphQLInt
            },

            reviewPricePaid: {
                type: GraphQLString
            },

            reviewPricePaidCurrency: {
                type: ReviewPricePaidCurrencyType
            }
        },

        outputFields: () => ({
            review: {
                type: types.communityItemTypes.review,
                resolve: async ({review}) => {
                    return review;
                }
            },

            viewer: {
                type: types.ViewerType,
                resolve: () => ({ id: 'viewer' })
            }
        }),

        mutateAndGetPayload: async (input, context) => {
            const {id: communityItemId} = fromGlobalId(input.communityItemId);
            const {id: reviewedTopicId} = fromGlobalId(input.reviewedTopicId);
            const {user} = context;

            const reviewDetails: IReview = {
                recordType: 'CommunityItem',
                reviewedTopicId: reviewedTopicId,
                reviewRating: input.reviewRating,
                reviewPricePaid: input.reviewPricePaid,
                reviewPricePaidCurrency: input.reviewPricePaidCurrency
            };

            const reviewResult = await reviewsAuthorizer.as(user).updateReviewDetails(
                communityItemId,
                reviewDetails
            );

            if (reviewResult instanceof NotAuthenticatedError) {
                addErrorToResponse(context.responseErrors, 'NotAuthenticated', reviewResult);
                return {review: null};

            } else if (reviewResult instanceof NotOwnerError) {
                addErrorToResponse(context.responseErrors, 'NotOwner', reviewResult);
                return {review: null};

            } else {

                return {review: reviewResult};
            }
        }
    });

    return {
        UpdateReviewDetailsMutation
    };
}
