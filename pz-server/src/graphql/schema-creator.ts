import promisify from 'pz-support/src/promisify';
import * as graphqlRelay from 'graphql-relay';
import {ITopic} from 'pz-server/src/models/topic';
import {IReview} from 'pz-server/src/models/review';
import * as graphql from 'graphql';
import {IAppRepositoryAuthorizers} from 'pz-server/src/app/repositories';
import {IRepositoryRecord} from 'pz-server/src/support/repository';

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

    const {nodeInterface, nodeField} = graphqlRelay.nodeDefinitions(
        idResolver, typeResolver
    );

    const ViewerType = new GraphQLObjectType({
        name: 'Viewer',

        fields: () => ({

            topics: {
                type: new GraphQLList(TopicType),
                resolve: (_, __, {user}) => topics.as(user).findAll()
            },
            reviews: {
                type: new GraphQLList(ReviewType),
                resolve: () => promisify(app.models.Review.find, app.models.Review)(),
            }
        })
    });

    const UserType = new GraphQLObjectType({
        name: 'User',

        fields: () => ({
            id: graphqlRelay.globalIdField('User'),

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
            id: graphqlRelay.globalIdField('Topic'),

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
            id: graphqlRelay.globalIdField('Review'),

            summary: {
                type: GraphQLString
            },

            body: {
                type: GraphQLString
            }
        }),

        interfaces: [nodeInterface]
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
