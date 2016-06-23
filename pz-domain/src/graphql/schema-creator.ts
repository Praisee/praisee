import promisify from 'pz-support/src/promisify';
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

    const TopicType = new GraphQLObjectType({
        name: 'Topic',

        fields: () => ({
            id: graphqlRelay.globalIdField('Topic'),

            name: {
                type: GraphQLString,
                resolve: (obj) => obj.name,
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
                }

            })
        })
    });
}
