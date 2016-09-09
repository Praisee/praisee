import {IAppRepositoryAuthorizers} from 'pz-server/src/app/repositories';
import {ITypes} from 'pz-server/src/graphql/types';
import {IVote} from 'pz-server/src/votes/votes';
import {AuthorizationError} from 'pz-server/src/support/authorization';
import convertTextToData from 'pz-server/src/content/text-to-data-converter';
import {parseInputContentData} from 'pz-server/src/content/input-content-data';
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

            bodyData: {
                type: GraphQLString,
                resolve: (source) => JSON.stringify(source.bodyData)
            },

            createdAt: {
                type: GraphQLString
            },

            user: {
                type: types.OtherUserType,
                resolve: async (comment, _, {user: currentUser}) => {
                    const user = await usersAuthorizer
                        .as(currentUser)
                        .findOtherUserById(comment.userId);

                    return user;
                }
            },

            comments: {
                type: new GraphQLList(CommentType),
                resolve: async ({id}, _, {user}) => {
                    const commentTree = await commentsAuthorizer
                        .as(user)
                        .findCommentTreeForComment(id);

                    return commentTree.comments;
                }
            },

            commentsAsJson: {
                type: GraphQLString,
                resolve: async (comment, _, {user}) => {
                    const commentTree = await commentsAuthorizer
                        .as(user)
                        .findCommentTreeForComment(comment.id);

                    return JSON.stringify(commentTree.comments);
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

    const CreateCommentFromCommunityItemMutation = mutationWithClientMutationId({
        name: 'CreateCommentFromCommunityItem',

        inputFields: () => ({
            body: { type: GraphQLString },
            bodyData: { type: types.InputContentDataType },
            commentId: { type: GraphQLString },
            communityItemId: { type: GraphQLString }
        }),

        outputFields: () => ({
            newComment: {
                type: types.CommentType,
                resolve: ({newComment}) => {
                    return newComment;
                }
            },
            comment: {
                type: types.CommentType,
                resolve: ({comment}) => {
                    return comment;
                }
            },
            communityItem: {
                type: types.CommunityItemType,
                resolve: ({communityItem}) => {
                    return communityItem;
                }
            }
        }),

        mutateAndGetPayload: async ({body, bodyData, communityItemId, commentId}, context) => {
            const parsedBodyData = parseInputContentData(body || bodyData);

            const {type, id} = fromGlobalId(commentId || communityItemId);
            const newComment = await commentsAuthorizer.as(context.user).create({
                recordType: 'Comment',
                parentType: type,
                parentId: id,
                bodyData: parsedBodyData,
            });

            if (newComment instanceof AuthorizationError) {
                return { newComment: null };
            }

            return { newComment };
        },
    });

    return {
        CommentType,
        CommentConnection,
        CreateCommentFromCommunityItemMutation
    };
}