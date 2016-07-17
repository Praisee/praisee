import promisify from 'pz-support/src/promisify';
import * as graphqlRelay from 'graphql-relay';
import * as graphql from 'graphql';
var connectionDefinitions = graphqlRelay.connectionDefinitions, fromGlobalId = graphqlRelay.fromGlobalId, nodeDefinitions = graphqlRelay.nodeDefinitions, connectionArgs = graphqlRelay.connectionArgs, globalId = graphqlRelay.globalId, connectionFromPromisedArray = graphqlRelay.connectionFromPromisedArray, globalIdField = graphqlRelay.globalIdField;
var GraphQLBoolean = graphql.GraphQLBoolean, GraphQLID = graphql.GraphQLID, GraphQLInt = graphql.GraphQLInt, GraphQLList = graphql.GraphQLList, GraphQLNonNull = graphql.GraphQLNonNull, GraphQLObjectType = graphql.GraphQLObjectType, GraphQLSchema = graphql.GraphQLSchema, GraphQLString = graphql.GraphQLString;
export default function createSchema(repositoryAuthorizers) {
    var users = repositoryAuthorizers.users, topics = repositoryAuthorizers.topics;
    var idResolver = function (globalId, _a) {
        var user = _a.user;
        var _b = graphqlRelay.fromGlobalId(globalId), type = _b.type, id = _b.id;
        var lowercaseType = type[0].toLowerCase() + type.slice(1);
        var repositoryAuthorizer = repositoryAuthorizers[lowercaseType];
        if (!repositoryAuthorizer) {
            return null;
        }
        return repositoryAuthorizer.as(user).findById(id);
    };
    var typeResolver = function (repositoryRecord) {
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
    var _a = nodeDefinitions(idResolver, typeResolver), nodeInterface = _a.nodeInterface, nodeField = _a.nodeField;
    var ViewerType = new GraphQLObjectType({
        name: 'Viewer',
        fields: function () { return ({
            topics: {
                type: new GraphQLList(TopicType),
                resolve: function (_, __, _a) {
                    var user = _a.user;
                    return topics.as(user).findAll();
                }
            },
            reviewConnection: {
                type: ReviewConnection.connectionType,
                args: connectionArgs,
                resolve: function (_, args) {
                    var Review = app.models.Review;
                    return connectionFromPromisedArray(promisify(Review.find, Review)({
                        limit: args.first + 1,
                        skip: args.after
                    }), args);
                }
            },
            commentConnection: {
                type: CommentConnection.connectionType,
                args: connectionArgs,
                resolve: function (_, args) {
                    return connectionFromPromisedArray(promisify(function () { }, {})(), args);
                }
            },
            avatarConnection: {
                type: AuthorConnection.connectionType,
                args: connectionArgs,
                resolve: function (_, args) {
                    return connectionFromPromisedArray(promisify(function () { }, {})(), args);
                }
            },
            votesConnection: {
                type: VotesConnection.connectionType,
                args: connectionArgs,
                resolve: function (_, args) {
                    return connectionFromPromisedArray(promisify(function () { }, {})(), args);
                }
            }
        }); }
    });
    var UserType = new GraphQLObjectType({
        name: 'User',
        fields: function () { return ({
            id: globalIdField('User'),
            username: {
                type: GraphQLString
            },
            email: {
                type: GraphQLString
            }
        }); },
        interfaces: [nodeInterface]
    });
    var TopicType = new GraphQLObjectType({
        name: 'Topic',
        fields: function () { return ({
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
        }); },
        interfaces: [nodeInterface]
    });
    var ReviewType = new GraphQLObjectType({
        name: 'Review',
        fields: function () { return ({
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
        }); },
        interfaces: [nodeInterface]
    });
    var CommentType = new GraphQLObjectType({
        name: 'Comment',
        fields: function () { return ({
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
        }); },
        interfaces: [nodeInterface]
    });
    var AuthorType = new GraphQLObjectType({
        name: 'Author',
        fields: function () { return ({
            id: globalIdField('Author'),
            name: {
                type: GraphQLString
            },
            reputation: {
                type: GraphQLString
            },
            image: {
                type: GraphQLString
            }
        }); },
        interfaces: [nodeInterface]
    });
    var VotesType = new GraphQLObjectType({
        name: 'Votes',
        fields: function () { return ({
            id: globalIdField('Votes'),
            rating: {
                type: GraphQLInt
            },
            count: {
                type: GraphQLInt
            }
        }); },
        interfaces: [nodeInterface]
    });
    var ReviewConnection = connectionDefinitions({
        name: "Review",
        nodeType: ReviewType
    });
    var CommentConnection = connectionDefinitions({
        name: "Comment",
        nodeType: CommentType
    });
    var AuthorConnection = connectionDefinitions({
        name: "Author",
        nodeType: AuthorType
    });
    var VotesConnection = connectionDefinitions({
        name: "Votes",
        nodeType: VotesType
    });
    return new GraphQLSchema({
        query: new GraphQLObjectType({
            name: 'Query',
            fields: function () { return ({
                node: nodeField,
                viewer: {
                    type: ViewerType,
                    resolve: function () { return ({}); }
                },
                currentUser: {
                    type: UserType,
                    resolve: function (_, __, _a) {
                        var user = _a.user;
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
                    resolve: resolveWithSession(function (_, _a) {
                        var urlSlug = _a.urlSlug;
                        var Topic = app.models.Topic;
                        return promisify(Topic.getByUrlSlugName, Topic)(urlSlug)
                            .catch(function (err) {
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
                    resolve: resolveWithSession(function (_, _a) {
                        var urlSlug = _a.urlSlug;
                        var Review = app.models.Review;
                        return promisify(Review.getByUrlSlugName, Review)(urlSlug);
                    })
                }
            }); }
        })
    });
}
