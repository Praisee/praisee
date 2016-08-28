import {IAppRepositoryAuthorizers} from 'pz-server/src/app/repositories';
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

export default function CommentTypes(repositoryAuthorizers: IAppRepositoryAuthorizers, nodeInterface, types: ITypes) {
    const commentsAuthorizer = repositoryAuthorizers.comments;

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

            comments: {
                type: GraphQLString,
                resolve: async (comment, _, {user}) => {

                    const jsonComment = await commentsAuthorizer
                        .as(user)
                        .findCommentTreeForComment(comment.id);
                    return JSON.stringify(jsonComment.comments);
                }
            },

            votes: {
                type: types.VoteType
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