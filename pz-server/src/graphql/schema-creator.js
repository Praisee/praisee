import promisify from 'pz-support/src/promisify';
import * as graphqlRelay from 'graphql-relay';
import * as graphql from 'graphql';
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
        }
        return null;
    };
    var _a = graphqlRelay.nodeDefinitions(idResolver, typeResolver), nodeInterface = _a.nodeInterface, nodeField = _a.nodeField;
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
            topic: {
                type: TopicType,
                args: {
                    urlSlug: {
                        type: GraphQLString
                    }
                },
                resolve: function (source, _a) {
                    var urlSlug = _a.urlSlug;
                    debugger;
                    var Topic = app.models.Topic;
                    var remotes = Topic.dataSource.connector.remotes;
                    return promisify(remotes.invoke, remotes)('getByUrlSlugName', [urlSlug])
                        .catch(function (err) {
                        debugger;
                        console.log(err);
                    });
                }
            }
        }); }
    });
    var UserType = new GraphQLObjectType({
        name: 'User',
        fields: function () { return ({
            id: graphqlRelay.globalIdField('User'),
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
        }); },
        interfaces: [nodeInterface]
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
                }
            }); }
        })
    });
}
