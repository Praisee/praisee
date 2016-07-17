import promisify from 'pz-support/src/promisify';
import * as graphqlRelay from 'graphql-relay';
import {ITopic} from 'pz-server/src/models/topic';
import {IReview} from 'pz-server/src/models/review';
import * as graphql from 'graphql';
import {IAppRepositoryAuthorizers} from 'pz-server/src/app/repositories';
import {IRepositoryRecord} from 'pz-server/src/support/repository';

var {
    connectionDefinitions,
    fromGlobalId,
    nodeDefinitions,
    connectionArgs,
    globalId,
    connectionFromPromisedArray,
    globalIdField
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
    const {users, topics} = repositoryAuthorizers;

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

            case 'Review':
                return ReviewType;
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
                resolve: (_, __, {user}) => topics.as(user).findAll()
            },
            reviewConnection: {
                type: ReviewConnection.connectionType,
                args: connectionArgs,
                resolve: (_, args) => {
                    const Review: IReview = app.models.Review;

                    return connectionFromPromisedArray(
                        promisify(Review.find, Review)(
                            {
                                //the +1 allows the hasNextPage argument to return true if there is more content
                                limit: args.first + 1,
                                skip: args.after
                            }),
                        args
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

            dateCreated: {
                type: GraphQLInt
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

            dateCreated: {
                type: GraphQLInt
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
                        return users.as(user).findCurrentUser();
                    }
                },

                topic: {
                    type: TopicType,
                    args: {
                        urlSlug: {
                            type: GraphQLString
                        }
                    },
                    resolve: resolveWithSession((_, {urlSlug}) => {
                        const Topic: ITopic = app.models.Topic;

                        return promisify(Topic.getByUrlSlugName, Topic)(urlSlug)
                            .catch((err) => {
                                console.log(err);
                            });
                    })
                },

                review: {
                    type: ReviewType,
                    args: {
                        urlSlug: {
                            type: GraphQLString
                        }
                    },
                    resolve: resolveWithSession((_, {urlSlug}) => {
                        const Review: IReview = app.models.Review;

                        return promisify(Review.getByUrlSlugName, Review)(urlSlug)
                    })
                }
            })
        })
    });
}
