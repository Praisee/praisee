import {IAppRepositoryAuthorizers} from 'pz-server/src/app/repositories';
import * as graphqlRelay from 'graphql-relay';
import * as graphql from 'graphql';
import {ITypes} from 'pz-server/src/graphql/types';
import {isTopicAttribute} from './topic-attributes';

var {
    GraphQLBoolean,
    GraphQLID,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLInputObjectType,
    GraphQLSchema,
    GraphQLString,
    GraphQLUnionType,
    GraphQLInterfaceType
} = graphql;

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

export function getTopicAttributeTypes(repositoryAuthorizers: IAppRepositoryAuthorizers, nodeInterface, types: ITypes) {
    const topicsAuthorizer = repositoryAuthorizers.topics;

    const TopicAttributeInterfaceType = new GraphQLInterfaceType({
        name: 'TopicAttributeInterfaceType',

        fields: () => ({
            id: {
                type: new GraphQLNonNull(GraphQLID)
            },

            topic: {
                type: new GraphQLNonNull(types.TopicType)
            },

            attributeType: {
                type: new GraphQLNonNull(GraphQLString)
            }
        }),

        resolveType: interfaceTypeResolver
    });

    const topicAttributeTypeTuples = [
        defineTopicAttributeType(
            'RelatedTopics',

            () => ({
                topics: {
                    type: new GraphQLNonNull(new GraphQLList(types.TopicType)),

                    resolve: async ({value}, _, {user}) => topicsAuthorizer
                        .as(user)
                        .findAllByIds(value)
                }
            })
        )
    ];

    function defineTopicAttributeType(attributeType: string, valueFields: () => ({})) {
        return ([
            attributeType,

            new GraphQLObjectType({
                name: attributeType + 'TopicAttribute',

                fields: () => {
                    return Object.assign({
                        id: globalIdField(attributeType + 'TopicAttribute'),

                        topic: {
                            type: new GraphQLNonNull(types.TopicType),

                            resolve: async({topicId}, _, {user}) => topicsAuthorizer
                                .as(user)
                                .findById(topicId)
                        },

                        attributeType: {
                            type: new GraphQLNonNull(GraphQLString)
                        }

                    }, valueFields());
                },

                interfaces: [nodeInterface, TopicAttributeInterfaceType]
            })
        ]);
    }

    const topicAttributeTypeMap = (topicAttributeTypeTuples
        .reduce((topicAttributeTypeMap, [attributeType, graphqlType]) => {
            topicAttributeTypeMap[attributeType] = graphqlType;
            return topicAttributeTypeMap;
        }, {})
    );

    function interfaceTypeResolver(topicAttribute) {
        return topicAttributeTypeMap[topicAttribute.attributeType];
    }


    return {
        TopicAttributeInterfaceType,
        topicAttributes: topicAttributeTypeMap
    };
}

export function topicAttributeIdResolver(repositoryAuthorizers: IAppRepositoryAuthorizers, type, id, user) {
    if (type.endsWith('TopicAttribute')) {
        return repositoryAuthorizers.topicAttributes.as(user).findById(id);
    }
}

export function topicAttributeTypeResolver(types: ITypes, source) {
    if (isTopicAttribute(source)) {
        return types.topicAttributes[source.attributeType];
    }
}
