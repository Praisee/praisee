import promisify from 'pz-support/src/promisify';
import {resolveWithAppAndSession} from 'pz-server/src/graphql/resolver-middlewares';
import * as graphqlRelay from 'graphql-relay';

import * as graphql from 'graphql';

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

export default function createSchema(app: IApp) {
    const resolveWithSession = (resolver) => {
        return resolveWithAppAndSession(app, 'pz-remote', resolver);
    };
    
    const idResolver = (globalId) => {
        const {type, id} = graphqlRelay.fromGlobalId(globalId);

        const Model = app.models[type];

        if (!Model) {
            return null;
        }

        return promisify(Model.findOne, Model)(id);
    };

    const typeResolver = (model) => {
        switch (model.modelName) {
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
                resolve: () => promisify(app.models.Topic.find, app.models.Topic)(),
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
                    resolve: resolveWithSession((_, __, {user}) => {
                        if (!user) {
                            return null;
                        }

                        return promisify(app.models.User.findById, app.models.User)(user.id);
                    })
                }

            })
        })
    });
}
