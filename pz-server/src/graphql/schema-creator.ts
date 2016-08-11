import promisify from 'pz-support/src/promisify';
import * as graphqlRelay from 'graphql-relay';
import * as graphql from 'graphql';
import {IAppRepositoryAuthorizers} from 'pz-server/src/app/repositories';
import {IRepositoryRecord} from 'pz-server/src/support/repository';
import {AuthorizationError} from 'pz-server/src/support/authorization';
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
        communityItems: communityItemsAuthorizer
    } = repositoryAuthorizers;

    const BiCursorFromGraphqlArgs = (graphqlArgs): TBiCursor => {
        const take = graphqlArgs.first || graphqlArgs.last || 10;

        if (graphqlArgs.last) {
            let cursor: IBackwardCursor = {
                takeLast: take
            };

            if (graphqlArgs.before) {
                cursor.skipBefore = graphqlArgs.before;
            }

            return cursor;

        } else {
            let cursor: IForwardCursor = {
                takeFirst: take
            };

            if (graphqlArgs.after) {
                cursor.skipAfter = graphqlArgs.after;
            }

            return cursor;
        }
    };

    const connectionFromCursorResults = <T>(cursorResults: ICursorResults<T>) => {
        let pageInfo: any = {
            hasNextPage: cursorResults.hasNextPage || false,
            hasPreviousPage: cursorResults.hasPreviousPage || false
        };

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

        if (type === 'Viewer') {
            return {id: 'viewer'};
        }

        const lowercaseType = type[0].toLowerCase() + type.slice(1);

        const repositoryAuthorizer = repositoryAuthorizers[lowercaseType];

        if (!repositoryAuthorizer) {
            return null;
        }

        return repositoryAuthorizer.as(user).findById(id);
    };

    const typeResolver = (repositoryRecord: IRepositoryRecord) => {
        switch (repositoryRecord.recordType) {
            case 'Viewer':
                return ViewerType;

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

            id: globalIdField('Viewer'),

            topics: {
                type: new GraphQLList(TopicType),
                resolve: (_, __, {user}) => topicsAuthorizer.as(user).findAll()
            },

            myCommunityItems: {
                type: CommunityItemConnection.connectionType,
                args: connectionArgs,

                resolve: async (_, args, {user}) => {
                    const cursor = BiCursorFromGraphqlArgs(args);

                    return connectionFromCursorResults(
                        await communityItemsAuthorizer
                            .as(user)
                            .findSomeByCurrentUser(cursor)
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
                type: CommunityItemConnection.connectionType,
                args: connectionArgs,

                resolve: async (topic, args, {user}) => {
                    const communityItems = await topicsAuthorizer
                            .as(user)
                            .findAllCommunityItemsRanked(topic.id)

                    return connectionFromArray(communityItems, args);
                }
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

            bodyData: {
                type: GraphQLString,
                resolve: (source) => JSON.stringify(source.bodyData)
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

    const InputContentDataType = new GraphQLInputObjectType({
        name: 'InputContentData',

        fields: {
            type: { type: new GraphQLNonNull(GraphQLString) },
            version: { type: new GraphQLNonNull(GraphQLString) },
            value: { type: new GraphQLNonNull(GraphQLString) },
            isJson: { type: GraphQLBoolean, defaultValue: false }
        }
    });

    const parseInputContentData = (inputContentData) => {
        return {
            type: inputContentData.type,
            version: inputContentData.version,
            value: inputContentData.isJson ?
                JSON.parse(inputContentData.value) : inputContentData.value,
        };
    };

    const CreateCommunityItemMutation = mutationWithClientMutationId({
        name: 'CreateCommunityItem',

        inputFields: {
            type: { type: new GraphQLNonNull(GraphQLString) },
            summary: { type: new GraphQLNonNull(GraphQLString) },
            bodyData: { type: new GraphQLNonNull(InputContentDataType) }
        },

        outputFields: {
            viewer: {
                type: ViewerType,
                resolve: () => ({id: 'viewer'})
            }
        },

        mutateAndGetPayload: async ({type, summary, bodyData}, context) => {
            const parsedBodyData = parseInputContentData(bodyData);

            const communityItem = await communityItemsAuthorizer.as(context.user).create({
                recordType: 'CommunityItem',
                type,
                summary,
                bodyData: parsedBodyData
            });

            if (communityItem instanceof AuthorizationError) {
                return { communityItem: null };
            }

            return { communityItem };
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
                    resolve: () => ({id: 'viewer'})
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
