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

    return {
        VoteType,
        VoteAggregateType
    };
}