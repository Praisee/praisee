import promisify from 'pz-support/src/promisify';
import * as graphqlRelay from 'graphql-relay';
import * as graphql from 'graphql';
import {IAppRepositoryAuthorizers} from 'pz-server/src/app/repositories';
import {IRepositoryRecord} from 'pz-server/src/support/repository';
import {AuthorizationError} from 'pz-server/src/support/authorization';
import {ICursorResults, IForwardCursor} from '../support/cursors';

var {
    connectionDefinitions,
    fromGlobalId,
    nodeDefinitions,
    connectionArgs,
    forwardConnectionArgs,
    globalId,
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
    GraphQLSchema,
    GraphQLString
} = graphql;

export default function createSchema(repositoryAuthorizers: IAppRepositoryAuthorizers) {
    const {
        users: usersAuthorizer,
        topics: topicsAuthorizer,
        communityItems: communityItemsAuthorizer
    } = repositoryAuthorizers;

    const forwardCursorFromGraphqlArgs = (graphqlArgs): IForwardCursor => {
        let cursor: any = {
            take: graphqlArgs.first || 10
        };

        if (graphqlArgs.after) {
            cursor.skipAfter = graphqlArgs.after;
        }

        return cursor;
    };

    const connectionFromCursorResults = <T>(cursorResults: ICursorResults<T>) => {
        let pageInfo: any = {
            hasNextPage: cursorResults.hasNextPage || false,
            hasPreviousPage: cursorResults.hasPreviousPage || false
        };

        if (cursorResults.startCursor) {
            pageInfo.startCursor = cursorResults.startCursor;
        }

        if (cursorResults.endCursor) {
            pageInfo.endCursor = cursorResults.endCursor;
        }

        return {
            edges: cursorResults.results.map(result => {
                return {
                    cursor: result.cursor,
                    node: result.item
                };
            }),

            pageInfo
        };
    };

    const idResolver = (globalId, {user}) => {
        const {type, id} = graphqlRelay.fromGlobalId(globalId);
        const lowercaseType = type[0].toLowerCase() + type.slice(1);

        const repositoryAuthorizer = repositoryAuthorizers[lowercaseType];

        if (!repositoryAuthorizer) {
            return null;
        }

        return repositoryAuthorizer.as(user).findById(id);
    };

    const typeResolver = (repositoryRecord: IRepositoryRecord) => {
        switch (repositoryRecord.recordType) {
            case 'User':
                return UserType;

            case 'Topic':
                return TopicType;

            case 'CommunityItem':
                return CommunityItemType;
        }

        return null;
    };

    const {nodeInterface, nodeField} = nodeDefinitions(
        idResolver, typeResolver
    );

    const ViewerType = new GraphQLObjectType({
        name: 'Viewer',

        fields: () => ({

            topics: {
                type: new GraphQLList(TopicType),
                resolve: (_, __, {user}) => topicsAuthorizer.as(user).findAll()
            },

            // TODO: This should probably be moved under the topic query, since it
            // TODO: should be in relation to a specific topic
            // TODO: Also, the -Connection part of the name may be unnecessary?
            communityItemConnection: {
                type: CommunityItemConnection.connectionType,
                args: connectionArgs,

                resolve: (_, args, {user}) => {
                    const repositoryAuthorizer = repositoryAuthorizers['communityItems'];
                    const CommunityItem = repositoryAuthorizer.as(user);

                    // TODO: This is not implemented yet
                    // return connectionFromPromisedArray(promisify(CommunityItem.find, CommunityItem)(
                    //     {
                    //         //the +1 allows the hasNextPage argument to return true if there is more content
                    //         limit: args.first + 1,
                    //         skip: args.after
                    //     }), args);
                    return connectionFromPromisedArray(Promise.resolve([]));
                }
            },

            myCommunityItems: {
                type: CommunityItemConnection.connectionType,
                args: forwardConnectionArgs,

                resolve: async (_, args, {user}) => {
                    const forwardCursor = forwardCursorFromGraphqlArgs(args);

                    return connectionFromCursorResults(
                        await communityItemsAuthorizer
                            .as(user)
                            .findSomeByCurrentUser(forwardCursor)
                    );
                }
            },

            commentConnection: {
                type: CommentConnection.connectionType,
                args: connectionArgs,

                resolve: (_, args) => {
                    return connectionFromPromisedArray(
                        //TODO: Implment this
                        promisify(() => { }, {})(),
                        args
                    );
                }
            },

            avatarConnection: {
                type: AuthorConnection.connectionType,
                args: connectionArgs,

                resolve: (_, args) => {
                    return connectionFromPromisedArray(
                        //TODO: Implment this
                        promisify(() => { }, {})(),
                        args
                    );
                }
            },

            votesConnection: {
                type: VotesConnection.connectionType,
                args: connectionArgs,

                resolve: (_, args) => {
                    return connectionFromPromisedArray(
                        //TODO: Implment this
                        promisify(() => { }, {})(),
                        args
                    );
                }
            },

            reviewConnection: {
                type: ReviewConnection.connectionType,
                args: connectionArgs,

                resolve: (_, args) => {
                    return connectionFromPromisedArray(
                        //TODO: Implment this
                        promisify(() => { }, {})(),
                        args
                    );
                }
            }
        })
    });

    const UserType = new GraphQLObjectType({
        name: 'User',

        fields: () => ({
            id: globalIdField('User'),

            username: {
                type: GraphQLString
            },

            email: {
                type: GraphQLString
            }
        }),

        interfaces: [nodeInterface]
    });

    const TopicType = new GraphQLObjectType({
        name: 'Topic',

        fields: () => ({
            id: globalIdField('Topic'),

            name: {
                type: GraphQLString
            },

            description: {
                type: GraphQLString
            },

            thumbnailPath: {
                type: GraphQLString
            },

            overviewContent: {
                type: GraphQLString
            },

            isVerified: {
                type: GraphQLBoolean
            },

            communityItems: {
                type: new GraphQLList(CommunityItemType)
            }
        }),

        interfaces: [nodeInterface]
    });

    const ReviewType = new GraphQLObjectType({
        name: 'Review',

        fields: () => ({
            id: globalIdField('Review'),

            summary: {
                type: GraphQLString
            },

            body: {
                type: GraphQLString
            },

            createdAt: {
                type: GraphQLString
            }
        }),

        interfaces: [nodeInterface]
    });

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

            text: {
                type: GraphQLString
            },

            createdAt: {
                type: GraphQLString
            }
        }),

        interfaces: [nodeInterface]
    });

    const AuthorType = new GraphQLObjectType({
        name: 'Author',

        fields: () => ({
            id: globalIdField('Author'),

            name: {
                type: GraphQLString
            },

            reputation: {
                type: GraphQLString
            },

            image: {
                type: GraphQLString
            },
        }),

        interfaces: [nodeInterface]
    });

    const VotesType = new GraphQLObjectType({
        name: 'Votes',

        fields: () => ({
            id: globalIdField('Votes'),

            rating: {
                type: GraphQLInt
            },

            count: {
                type: GraphQLInt
            }
        }),

        interfaces: [nodeInterface]
    });

    const CommunityItemType = new GraphQLObjectType({
        name: 'CommunityItem',

        fields: () => ({
            id: globalIdField('CommunityItem'),

            type: {
                type: new GraphQLNonNull(GraphQLString)
            },

            summary: {
                type: GraphQLString
            },

            body: {
                type: GraphQLString
            },

            createdAt: {
                type: GraphQLString
            },

            udpdatedAt: {
                type: GraphQLString
            }
        }),

        interfaces: [nodeInterface]
    });

    const ReviewConnection = connectionDefinitions({
        name: "Review",
        nodeType: ReviewType
    });

    const CommentConnection = connectionDefinitions({
        name: "Comment",
        nodeType: CommentType
    });

    const AuthorConnection = connectionDefinitions({
        name: "Author",
        nodeType: AuthorType
    });

    const VotesConnection = connectionDefinitions({
        name: "Votes",
        nodeType: VotesType
    });

    const CommunityItemConnection = connectionDefinitions({
        name: "CommunityItem",
        nodeType: CommunityItemType
    });

    const CreateCommunityItemMutation = mutationWithClientMutationId({
        name: 'CreateCommunityItem',

        inputFields: {
            type: { type: new GraphQLNonNull(GraphQLString) },
            summary: { type: new GraphQLNonNull(GraphQLString) },
            body: { type: new GraphQLNonNull(GraphQLString) }
        },

        outputFields: {
            communityItem: {
                type: CommunityItemType,
                resolve: (communityItem) => communityItem
            }

            // todoEdge: {
            //     type: GraphQLTodoEdge,
            //     resolve: ({localTodoId}) => {
            //         const todo = getTodo(localTodoId);
            //         return {
            //             cursor: cursorForObjectInConnection(getTodos(), todo),
            //             node: todo,
            //         };
            //     },
            // },
            // viewer: {
            //     type: GraphQLUser,
            //     resolve: () => getViewer(),
            // },
        },

        mutateAndGetPayload: async ({type, summary, body}, context) => {
            const communityItem = await communityItemsAuthorizer.as(context.user).create({
                recordType: 'CommunityItem',
                type,
                summary,
                body
            });

            if (communityItem instanceof AuthorizationError) {
                return {communityItem: null};
            }

            return {communityItem};
        },
    });

    return new GraphQLSchema({
        query: new GraphQLObjectType({
            name: 'Query',

            fields: () => ({
                node: nodeField,

                // Viewer must be at the query root due to a limitation in Relay's design
                // See https://github.com/facebook/relay/issues/112
                viewer: {
                    type: ViewerType,
                    resolve: () => ({})
                },

                currentUser: {
                    type: UserType,
                    resolve: (_, __, {user}) => {
                        return usersAuthorizer.as(user).findCurrentUser();
                    }
                },

                topic: {
                    type: TopicType,
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
                },

                review: {
                    type: ReviewType,
                    args: {
                        urlSlug: {
                            type: GraphQLString
                        }
                    },
                    resolve: (_, {urlSlug}) => {
                        return {}; //TODO: Implement
                    }
                }
            })
        }),

        mutation: new GraphQLObjectType({
            name: 'Mutation',

            fields: {
                createCommunityItem: CreateCommunityItemMutation
            }
        })
    });
}
