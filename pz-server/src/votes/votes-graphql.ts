import { IVote, IVoteAggregate } from 'pz-server/src/votes/votes';
import { IAppRepositoryAuthorizers } from 'pz-server/src/app/repositories';
import { AuthorizationError } from 'pz-server/src/support/authorization';
import CommunityItemTypes from 'pz-server/src/community-items/community-items-graphql';
import { ITypes } from 'pz-server/src/graphql/types';
import { addErrorToResponse } from 'pz-server/src/errors/errors-graphql';
import * as graphqlRelay from 'graphql-relay';
import * as graphql from 'graphql';

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

export default function VoteTypes(repositoryAuthorizers: IAppRepositoryAuthorizers, nodeInterface, types: ITypes) {
    const votesAuthorizer = repositoryAuthorizers.votes;
    const commentsAuthorizer = repositoryAuthorizers.comments;
    const communityItemAuthorizer = repositoryAuthorizers.communityItems;
    const userAuthorizer = repositoryAuthorizers.users;

    const VoteType = new GraphQLObjectType({
        name: 'Vote',

        fields: () => ({
            currentUserVote: {
                type: GraphQLBoolean,
                resolve: async ({id: parentGlobalId}, __, {user}) => {

                    if (!user) return null;
                    if (!parentGlobalId) return null;
                    let {type, id} = fromGlobalId(parentGlobalId);

                    let data = await votesAuthorizer
                        .as(user)
                        .findCurrentUserVoteForParent(type, id);

                    if (!data || data instanceof (AuthorizationError))
                        return null;

                    let vote = data as IVote;
                    return vote.isUpVote;
                }
            },

            aggregate: {
                type: VoteAggregateType,
                resolve: async ({id: parentGlobalId}, __, {user}) => {

                    if (!user) return null;
                    if (!parentGlobalId) return null;

                    let {type, id} = fromGlobalId(parentGlobalId);

                    let aggregate = await votesAuthorizer
                        .as(user)
                        .getAggregateForParent(type, id);

                    if (!aggregate || aggregate instanceof (AuthorizationError))
                        return null;

                    return aggregate;
                }
            }
        })
    });

    const VoteAggregateType = new GraphQLObjectType({
        name: 'VoteAggregate',

        fields: () => ({
            upVotes: {
                type: GraphQLInt
            },

            downVotes: {
                type: GraphQLInt
            },

            total: {
                type: GraphQLInt
            }
        })
    });

    const CreateVoteMutation = mutationWithClientMutationId({
        name: 'CreateVote',
        inputFields: () => ({
            communityItemId: {
                type: GraphQLString
            },
            commentId: {
                type: GraphQLString
            },
            isUpVote: {
                type: new GraphQLNonNull(GraphQLBoolean)
            },
            affectedUserId: {
                type: GraphQLString
            }
        }),
        outputFields: () => ({
            error: {
                type: GraphQLString
            },
            vote: {
                type: types.VoteType,
                resolve: async ({ vote }) => {
                    return vote;
                }
            },
            comment: {
                type: types.CommentType,
                resolve: async ({commentId, user}) => {
                    return await commentsAuthorizer
                        .as(user)
                        .findById(commentId);
                }
            },
            communityItem: {
                type: types.CommunityItemType,
                resolve: async ({communityItemId, user}) => {
                    return await communityItemAuthorizer
                        .as(user)
                        .findById(communityItemId);
                }
            },
            affectedUser: {
                type: types.UserInterfaceType,
                resolve: async ({affectedUserId, user}) => {
                    return await userAuthorizer
                        .as(user)
                        .findUserById(affectedUserId);
                }
            },
            viewer: {
                type: types.ViewerType,
                resolve: () => ({ id: 'viewer' })
            }
        }),
        mutateAndGetPayload: async ({affectedUserId, commentId, communityItemId, isUpVote}, context) => {
            let {id: affectedUserIdParsed} = fromGlobalId(affectedUserId);
            let {id, type} = fromGlobalId(commentId || communityItemId);
            let {user} = context;

            const result = await votesAuthorizer.as(user).create({
                recordType: 'Vote',
                parentId: id,
                parentType: type,
                isUpVote: isUpVote
            });

            if (result instanceof AuthorizationError) {
                addErrorToResponse(context.responseErrors, 'NotAuthenticated', result);
            }

            return { affectedUserId: affectedUserIdParsed, user, commentId: id, communityItemId: id };
        }
    });

    const DeleteVoteMutation = mutationWithClientMutationId({
        name: 'DeleteVote',
        inputFields: {
            communityItemId: {
                type: GraphQLString
            },
            commentId: {
                type: GraphQLString
            },
            affectedUserId: {
                type: GraphQLString
            }
        },
        outputFields: () => ({
            error: {
                type: GraphQLString
            },
            comment: {
                type: types.CommentType,
                resolve: async ({commentId, user}) => {
                    return await commentsAuthorizer
                        .as(user)
                        .findById(commentId);
                }
            },
            communityItem: {
                type: types.CommunityItemType,
                resolve: async ({communityItemId, user}) => {
                    return await communityItemAuthorizer
                        .as(user)
                        .findById(communityItemId);
                }
            },
            affectedUser: {
                type: types.UserInterfaceType,
                resolve: async ({affectedUserId, user}) => {
                    return await userAuthorizer
                        .as(user)
                        .findUserById(affectedUserId);
                }
            },
            viewer: {
                type: types.ViewerType,
                resolve: () => ({ id: 'viewer' })
            }
        }),
        mutateAndGetPayload: async ({affectedUserId, communityItemId, commentId}, context) => {
            let {id: affectedUserIdParsed} = fromGlobalId(affectedUserId);
            let {type, id} = fromGlobalId(communityItemId || commentId);
            let {user} = context;

            const result = await votesAuthorizer.as(user).findCurrentUserVoteForParent(type, id);

            if (result instanceof AuthorizationError) {
                addErrorToResponse(context.responseErrors, 'NotAuthenticated', result);
            }
            else {
                let deleteResult = await votesAuthorizer.as(user).destroy(result);
                if (deleteResult instanceof AuthorizationError) {
                    addErrorToResponse(context.responseErrors, 'NotOwner', deleteResult);
                }
            }
            return { affectedUserId: affectedUserIdParsed, user, communityItemId: id, commentId: id };
        }
    });

    const UpdateVoteMutation = mutationWithClientMutationId({
        name: 'UpdateVote',
        inputFields: {
            communityItemId: {
                type: GraphQLString
            },
            commentId: {
                type: GraphQLString
            },
            isUpVote: {
                type: GraphQLBoolean
            },
            affectedUserId: {
                type: GraphQLString
            }
        },
        outputFields: () => ({
            error: {
                type: GraphQLString
            },
            comment: {
                type: types.CommentType,
                resolve: async ({commentId, user}) => {
                    return await commentsAuthorizer
                        .as(user)
                        .findById(commentId);
                }
            },
            communityItem: {
                type: types.CommunityItemType,
                resolve: async ({communityItemId, user}) => {
                    return await communityItemAuthorizer
                        .as(user)
                        .findById(communityItemId);
                }
            },
            affectedUser: {
                type: types.UserInterfaceType,
                resolve: async ({affectedUserId, user}) => {
                    return await userAuthorizer
                        .as(user)
                        .findUserById(affectedUserId);
                }
            },
            viewer: {
                type: types.ViewerType,
                resolve: () => ({ id: 'viewer' })
            }
        }),
        mutateAndGetPayload: async ({affectedUserId, commentId, communityItemId, isUpVote}, context) => {
            let {id: affectedUserIdParsed} = fromGlobalId(affectedUserId);
            let {id, type} = fromGlobalId(commentId || communityItemId);
            let {user} = context;

            const findVoteResult = await votesAuthorizer.as(user).findCurrentUserVoteForParent(
                type,
                id);

            if (findVoteResult instanceof AuthorizationError) {
                addErrorToResponse(context.responseErrors, 'NotAuthenticated', findVoteResult);
            }
            else {
                findVoteResult.isUpVote = isUpVote;
                const updateVoteResult = await votesAuthorizer.as(user).update(findVoteResult);

                if (updateVoteResult instanceof AuthorizationError) {
                    addErrorToResponse(context.responseErrors, 'NotOwner', updateVoteResult);
                }
            }
            return { affectedUserId: affectedUserIdParsed, user, communityItemId: id, commentId: id };
        }
    });

    return {
        VoteType,
        VoteAggregateType,
        CreateVoteMutation,
        UpdateVoteMutation,
        DeleteVoteMutation
    };
}