import {IAppRepositoryAuthorizers} from 'pz-server/src/app/repositories';
import {ITypes} from 'pz-server/src/graphql/types';
import * as graphqlRelay from 'graphql-relay';
import * as graphql from 'graphql';

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

export default function UsersTypes(repositoryAuthorizers: IAppRepositoryAuthorizers, nodeInterface, types: ITypes) {
     const UserType = new GraphQLObjectType({
        name: 'User',

        fields: () => ({
            id: globalIdField(UserType.Name),

            displayName: {
                type: GraphQLString
            },

            username: {
                type: GraphQLString
            },

            email: {
                type: GraphQLString
            }
        }),

        interfaces: [nodeInterface]
    });

    const OtherUserType = new GraphQLObjectType({
        name: 'OtherUser',

        fields: () => ({
            id: globalIdField(OtherUserType.name),

            displayName: {
                type: GraphQLString
            },

            reputation:{
                type: GraphQLInt
            },

            image: {
                type: GraphQLString
            }
        }),

        interfaces: [nodeInterface]
    });

     return Object.assign({}, types, {
        UserType,
        OtherUserType
    });
}
