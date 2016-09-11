import {IVote, IVoteAggregate} from 'pz-server/src/votes/votes';
import {IAppRepositoryAuthorizers} from 'pz-server/src/app/repositories';
import {AuthorizationError} from 'pz-server/src/support/authorization';
import CommunityItemTypes from 'pz-server/src/community-items/community-items-graphql';
import {ITypes} from 'pz-server/src/graphql/types';
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
            }
        }),
        mutateAndGetPayload: async ({commentId, communityItemId, isUpVote}, {user}) => {
            let {id, type} = fromGlobalId(commentId || communityItemId);

            const vote = await votesAuthorizer.as(user).create({
                recordType: 'Vote',
                parentId: id,
                parentType: type,
                isUpVote: isUpVote
            });

            let error = null;
            if (vote instanceof AuthorizationError) {
                error = vote.message;
                return { error, vote: null, commentId: id, communityItemId: id };
            }
            else {
                return { error, vote, commentId: id, communityItemId: id };
            }
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
            }
        }),
        mutateAndGetPayload: async ({communityItemId, commentId}, {user}) => {
            let {type, id} = fromGlobalId(communityItemId || commentId);

            const voteResult = await votesAuthorizer.as(user).findCurrentUserVoteForParent(type, id);

            if (voteResult instanceof AuthorizationError) {
                return { error: 'You are not authorized to do this', vote: null, communityItemId: id, commentId: id };
            }
            else {
                let deleteResult = await votesAuthorizer.as(user).destroy(voteResult);

                return { error: null, vote: null, communityItemId: id, commentId: id };
            }
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
            isUpVote:{
                type: GraphQLBoolean
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
            }
        }),
        mutateAndGetPayload: async ({commentId, communityItemId, isUpVote}, {user}) => {
            let {id, type} = fromGlobalId(commentId || communityItemId);

            const findVoteResult = await votesAuthorizer.as(user).findCurrentUserVoteForParent(
                type,
                id);

            if (findVoteResult instanceof AuthorizationError) {
                return { error: findVoteResult.message, vote: null, communityItemId: id, commentId: id };
            }
            else {
                findVoteResult.isUpVote = isUpVote;
                const updateVoteResult = await votesAuthorizer.as(user).update(findVoteResult);

                if (findVoteResult instanceof AuthorizationError) {
                    return { error: '', vote: null, communityItemId: id, commentId: id };
                }
                else {
                    return { error: '', vote: updateVoteResult, user, communityItemId: id, commentId: id };
                }
            }
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