import {IAppRepositoryAuthorizers} from 'pz-server/src/app/repositories';
import {ITypes} from 'pz-server/src/graphql/types';
import {IVote} from 'pz-server/src/votes/votes';

import {
    AuthorizationError,
    NotAuthenticatedError,
    NotOwnerError
} from 'pz-server/src/support/authorization';

import {parseInputContentData} from 'pz-server/src/content/input-content-data';
import {addErrorToResponse} from 'pz-server/src/errors/errors-graphql';
import * as graphqlRelay from 'graphql-relay';
import * as graphql from 'graphql';
import {getViewerField} from '../graphql/viewer-graphql';

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
    const communityItemsAuthorizer = repositoryAuthorizers.communityItems;
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
                type: types.UserInterfaceType,
                resolve: async (comment, _, {user: currentUser}) => {
                    const user = await usersAuthorizer
                        .as(currentUser)
                        .findUserById(comment.userId);

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

            commentCount: {
                type: GraphQLInt,
                resolve: async ({id}, _, {user}) => {
                    const commentCount = await commentsAuthorizer
                        .as(user)
                        .getCountForParent("Comment", id);

                    return commentCount;
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

                resolve: async ({id}, __, {user}) => {
                return commentsAuthorizer
                    .as(user)
                    .getReputationEarned(id);
                }
            }
        }),

        interfaces: [nodeInterface]
    });

    const CommentConnection = connectionDefinitions({
        name: "Comment",
        nodeType: CommentType
    });

    const CreateCommentMutation = mutationWithClientMutationId({
        name: 'CreateComment',

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
                resolve: async ({parentId, user}) => {
                    return await commentsAuthorizer
                        .as(user)
                        .findById(parentId);
                }
            },
            communityItem: {
                type: types.CommunityItemInterfaceType,
                resolve: async ({parentId, user}) => {
                    return await communityItemsAuthorizer
                        .as(user)
                        .findById(parentId);
                }
            },

            viewer: getViewerField(types)
        }),

        mutateAndGetPayload: async ({body, bodyData, communityItemId, commentId}, context) => {
            const parsedBodyData = parseInputContentData(body || bodyData);

            const {type, id} = fromGlobalId(commentId || communityItemId);
            const response = await commentsAuthorizer.as(context.user).create({
                recordType: 'Comment',
                parentType: type,
                parentId: id,
                bodyData: parsedBodyData,
            });

            if (response instanceof AuthorizationError) {
                addErrorToResponse(context.responseErrors, 'NotAuthenticated', response);
                return { parentId: id };
            }

            return { newComment: response, parentId: id };
        },
    });

    const UpdateCommentMutation = mutationWithClientMutationId({
        name: 'UpdateComment',

        inputFields: () => ({
            id: { type: new GraphQLNonNull(GraphQLID) },
            body: { type: GraphQLString },
            bodyData: { type: types.InputContentDataType }
        }),

        outputFields: () => ({
            comment: {
                type: types.CommentType,
                resolve: ({comment}) => comment
            },

            viewer: getViewerField(types)
        }),

        mutateAndGetPayload: async ({id: rawId, body, bodyData}, context) => {
            const {id} = fromGlobalId(rawId);

            const parsedBodyData = parseInputContentData(body || bodyData);
            const authorizedComments = commentsAuthorizer.as(context.user);

            const oldComment = await authorizedComments.findById(id);

            if (!oldComment) {
                addErrorToResponse(context.responseErrors, 'NotFound', new Error('Comment was not found'));
                return {};
            }

            let updatedComment = await authorizedComments.update(Object.assign(
                {}, oldComment, {
                    recordType: 'Comment',
                    id,
                    bodyData: parsedBodyData
                }
            ));

            if (updatedComment instanceof AuthorizationError) {
                if (updatedComment instanceof NotAuthenticatedError) {
                    addErrorToResponse(context.responseErrors, 'NotAuthenticated', updatedComment);
                } else if (updatedComment instanceof NotOwnerError) {
                    addErrorToResponse(context.responseErrors, 'NotOwnerError', updatedComment);
                }

                return {};
            }

            return { comment: updatedComment };
        },
    });

    return {
        CommentType,
        CommentConnection,
        CreateCommentMutation,
        UpdateCommentMutation
    };
}
