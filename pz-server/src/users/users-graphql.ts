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

export default function UsersTypes(repositoryAuthorizers: IAppRepositoryAuthorizers, nodeInterface, types: ITypes) {
    var resolveType = function (value) {
        if (value.email) {
            return CurrentUserType;
        }
        else {
            return OtherUserType;
        }
    }

    var UserInterfaceType = new GraphQLInterfaceType({
        name: 'UserInterface',

        fields: () => ({
            id: globalIdField('User'),

            displayName: {
                type: GraphQLString
            },

            reputation: {
                type: GraphQLInt
            },

            image: {
                type: GraphQLString
            }
        }),

        resolveType: resolveType
    });

    var CurrentUserType = new GraphQLObjectType({
        name: 'CurrentUser',

        fields: () => ({
            id: globalIdField(CurrentUserType.Name),

            displayName: {
                type: GraphQLString
            },

            reputation: {
                type: GraphQLInt
            },

            image: {
                type: GraphQLString
            },

            username: {
                type: GraphQLString
            },

            email: {
                type: GraphQLString
            }
        }),

        interfaces: [nodeInterface, UserInterfaceType]
    });

    var OtherUserType = new GraphQLObjectType({
        name: 'OtherUser',

        fields: () => ({
            id: globalIdField(OtherUserType.name),

            displayName: {
                type: GraphQLString
            },

            reputation: {
                type: GraphQLInt
            },

            image: {
                type: GraphQLString
            }
        }),

        interfaces: [nodeInterface, UserInterfaceType]
    });

    return Object.assign({}, types, {
        UserInterfaceType,
        CurrentUserType,
        OtherUserType
    });
}
