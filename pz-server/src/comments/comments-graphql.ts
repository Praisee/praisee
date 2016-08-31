import {IAppRepositoryAuthorizers} from 'pz-server/src/app/repositories';
import {ITypes} from 'pz-server/src/graphql/types';
import {IVote} from 'pz-server/src/votes/votes';
import {AuthorizationError} from 'pz-server/src/support/authorization';
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

export default function CommentTypes(repositoryAuthorizers: IAppRepositoryAuthorizers, nodeInterface, types: ITypes) {
    const commentsAuthorizer = repositoryAuthorizers.comments;
    const usersAuthorizer = repositoryAuthorizers.users;
    const votesAuthorizer = repositoryAuthorizers.votes;

    const CommentType = new GraphQLObjectType({
        name: 'Comment',

        fields: () => ({
            id: globalIdField('Comment'),

            upVotes: {
                type: GraphQLInt
            },

            downVotes: {
                type: GraphQLInt
            },

            body: {
                type: GraphQLString
            },

            createdAt: {
                type: GraphQLString
            },

            user: {
                type: types.OtherUserType,
                resolve: async ({id}, _, {user: currentUser}) => {
                    const user = await usersAuthorizer
                        .as(currentUser)
                        .findOtherUserById(id);

                    return user;
                }
            },

            comments: {
                type: GraphQLString,
                resolve: async (comment, _, {user}) => {

                    const jsonComment = await commentsAuthorizer
                        .as(user)
                        .findCommentTreeForComment(comment.id);
                    return JSON.stringify(jsonComment.comments);
                }
            },

            currentUserVote: {
                type: GraphQLBoolean,
                resolve: async ({id}, __, {user}) => {
                    if (!user) return null;

                    let data = await votesAuthorizer
                        .as(user)
                        .findCurrentUserVoteForParent("Comment", id);

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
                        .getAggregateForParent("Comment", id);

                    if (!aggregate || aggregate instanceof (AuthorizationError))
                        return null;

                    return aggregate;
                }
            }
        }),

        interfaces: [nodeInterface]
    });

    const CommentConnection = connectionDefinitions({
        name: "Comment",
        nodeType: CommentType
    });

    return {
        CommentType,
        CommentConnection
    };
}