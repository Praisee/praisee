import promisify from 'pz-support/src/promisify';
import * as graphqlRelay from 'graphql-relay';
import * as graphql from 'graphql';
import {IAppRepositoryAuthorizers} from 'pz-server/src/app/repositories';
import {IRepositoryRecord} from 'pz-server/src/support/repository';

import {initializeTypes}  from 'pz-server/src/graphql/types';

import {
    ICursorResults,
    TBiCursor, IBackwardCursor, IForwardCursor
} from 'pz-server/src/support/cursors/cursors';

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

export default function createSchema(repositoryAuthorizers: IAppRepositoryAuthorizers) {
    const {
        users: usersAuthorizer,
        topics: topicsAuthorizer,
        communityItems: communityItemsAuthorizer,
        comments: commentsAuthorizer,
        votes: votesAuthorizer
    } = repositoryAuthorizers;

   
    const idResolver = (globalId, {user}) => {
        const {type, id} = graphqlRelay.fromGlobalId(globalId);

        if (type === 'Viewer') {
            return { id: 'viewer' };
        }

        if (type === 'OtherUser') {
            return usersAuthorizer.as(user).findOtherUserById(id);
        }

        let repositoryAuthorizer;

        switch (type) {
            case 'User':
                repositoryAuthorizer = usersAuthorizer;
                break;

            case 'Topic':
                repositoryAuthorizer = topicsAuthorizer;
                break;

            case 'CommunityItem':
                repositoryAuthorizer = communityItemsAuthorizer;
                break;

            case 'Comment':
                repositoryAuthorizer = commentsAuthorizer;
                break;
        }

        if (!repositoryAuthorizer) {
            return null;
        }

        return repositoryAuthorizer.as(user).findById(id);
    };

    const typeResolver = (repositoryRecord: IRepositoryRecord) => {
        switch (repositoryRecord.recordType) {
            case 'Viewer':
                return Types.ViewerType;

            case 'User':
                return Types.UserType;

            case 'Topic':
                return Types.TopicType;

            case 'CommunityItem':
                return Types.CommunityItemType;

            case 'Comment':
                return Types.CommentType;
        }

        return null;
    };

    const {nodeInterface, nodeField} = nodeDefinitions(
        idResolver, typeResolver
    );
    
    const Types = initializeTypes(repositoryAuthorizers, nodeInterface);

    return new GraphQLSchema({
        query: new GraphQLObjectType({
            name: 'Query',

            fields: () => ({
                node: nodeField,

                // Viewer must be at the query root due to a limitation in Relay's design
                // See https://github.com/facebook/relay/issues/112
                viewer: {
                    type: Types.ViewerType,
                    resolve: () => ({ id: 'viewer' })
                },

                currentUser: {
                    type: Types.UserType,
                    resolve: (_, __, {user}) => {
                        return usersAuthorizer.as(user).findCurrentUser();
                    }
                },

                topic: {
                    type: Types.TopicType,
                    args: {
                        urlSlug: {
                            type: GraphQLString
                        }
                    },
                    resolve: (_, {urlSlug}, {user}) => {
                        const topics = topicsAuthorizer.as(user);

                        return topics.findByUrlSlugName(urlSlug)
                            .catch((err) => {
                                console.log(err);
                            });
                    }
                }
            })
        }),

        mutation: new GraphQLObjectType({
            name: 'Mutation',

            fields: {
                createCommunityItem: Types.CreateCommunityItemMutation,
                createCommunityItemVote: Types.CreateCommunityItemVoteMutation,
                deleteCommunityItemVote: Types.DeleteCommunityItemVoteMutation,
                updateCommunityItemVote: Types.UpdateCommunityItemVoteMutation
            }
        })
    });
}
