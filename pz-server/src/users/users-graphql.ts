import {
    authorizer,
    TOptionalUser,
    NotOwnerError,
    NotAuthenticatedError,
    AuthorizationError,
    IAuthorizer
} from 'pz-server/src/support/authorization';

import {addErrorToResponse} from 'pz-server/src/errors/errors-graphql';
import {IAppRepositoryAuthorizers} from 'pz-server/src/app/repositories';
import {ITypes} from 'pz-server/src/graphql/types';
import * as graphqlRelay from 'graphql-relay';
import * as graphql from 'graphql';
import MD5 from 'MD5';

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
    let userAuthorizer = repositoryAuthorizers.users;

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
            },

            trusterCount: {
                type: GraphQLInt
            }
        }),

        resolveType: resolveType
    });

    var CurrentUserType = new GraphQLObjectType({
        name: 'CurrentUser',

        fields: () => ({
            id: globalIdField(CurrentUserType.Name),

            serverId: {
                type: new GraphQLNonNull(GraphQLInt),
                resolve: (user) => user.id
            },

            displayName: {
                type: GraphQLString
            },

            reputation: {
                type: GraphQLInt,
                resolve: async ({id}, _, {user}) => {
                    return userAuthorizer.as(user).getReputation(id);
                }
            },

            image: {
                type: GraphQLString,
                resolve: ({email}) => {
                    return calculateGravatarUrl(email);
                }
            },

            username: {
                type: GraphQLString
            },

            email: {
                type: GraphQLString
            },

            trusterCount: {
                type: GraphQLInt,
                resolve: async ({id}, _, {user}) => {
                    return userAuthorizer.as(user).getTotalTrusters(id);
                }
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
                type: GraphQLInt,
                resolve: async ({id}, _, {user}) => {
                    return userAuthorizer.as(user).getReputation(id);
                }
            },

            image: {
                type: GraphQLString,
                resolve: ({email}) => {
                    return calculateGravatarUrl(email);
                }
            },

            trusterCount: {
                type: GraphQLInt,
                resolve: async ({id}, _, {user}) => {
                    return userAuthorizer.as(user).getTotalTrusters(id);
                }
            },

            isCurrentUserTrusting: {
                type: GraphQLBoolean,
                resolve: ({id}, _, {user}) => {
                    return userAuthorizer.as(user).isUserTrusting(id);
                }
            }
        }),

        interfaces: [nodeInterface, UserInterfaceType]
    });

    const ToggleTrustMutation = mutationWithClientMutationId({
        name: 'ToggleTrust',

        inputFields: () => ({
            trustedId: { type: new GraphQLNonNull(GraphQLString) }
        }),

        outputFields: () => ({
            trustedUser: {
                type: types.OtherUserType,
                resolve: async ({trustedId, user}) => {
                    return await userAuthorizer
                        .as(user)
                        .findUserById(trustedId);
                }
            },

            viewer: {
                type: types.ViewerType,
                resolve: () => ({ id: 'viewer' })
            }
        }),

        mutateAndGetPayload: async ({trustedId}, context) => {
            const {id} = fromGlobalId(trustedId);
            const trustedIdParsed = parseInt(id);

            const response = await userAuthorizer.as(context.user).toggleTrust(trustedIdParsed);

            if (response instanceof AuthorizationError) {
                addErrorToResponse(context.responseErrors, 'NotAuthenticated', response);
            }

            return { trustedId: trustedIdParsed };
        }
    });

    return Object.assign({}, types, {
        UserInterfaceType,
        CurrentUserType,
        OtherUserType,
        ToggleTrustMutation
    });
}

function calculateGravatarUrl(email: string){
    const hash = MD5(email.toLowerCase().trim());
    return `https://www.gravatar.com/avatar/${hash}`;
}