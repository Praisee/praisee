import promisify from 'pz-support/src/promisify';
import * as graphqlRelay from 'graphql-relay';

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
                }

            })
        })
    });
}
