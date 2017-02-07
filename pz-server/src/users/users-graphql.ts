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

    var resolveType = function (value, {user}) {
        if (user && user.id === value.id) {
            return CurrentUserType;
        }
        else {
            return OtherUserType;
        }
    };

    var UserInterfaceType = new GraphQLInterfaceType({
        name: 'UserInterface',

        fields: () => ({
            id: { type: GraphQLString },

            displayName: { type: GraphQLString },

            reputation: { type: GraphQLInt },

            image: { type: GraphQLString },

            trusterCount: { type: GraphQLInt },

            isCurrentUser: { type: new GraphQLNonNull(GraphQLBoolean) }
        }),

        resolveType: resolveType
    });

    var CurrentUserType = new GraphQLObjectType({
        name: 'CurrentUser',

        fields: () => ({
            id: {
                type: GraphQLString,
                resolve: ({id}, _, {user}) => {
                    if (id === 'CurrentUser') {
                        return id;
                    }

                    if (user) {
                        return toUserId(user.id);
                    }
                }
            },

            displayName: {
                type: GraphQLString
            },

            reputation: {
                type: GraphQLInt,
                resolve: async ({id}, _, {user}) => {
                    if (user)
                        return userAuthorizer.as(user).getReputation(id);
                }
            },

            image: {
                type: GraphQLString,
                resolve: ({email}) => {
                    if (email)
                        return calculateGravatarUrl(email);
                }
            },

            email: {
                type: new GraphQLNonNull(GraphQLString)
            },

            trusterCount: {
                type: GraphQLInt,
                resolve: async ({id}, _, {user}) => {
                    if (user)
                        return userAuthorizer.as(user).getTotalTrusters(id);
                }
            },

            serverId: {
                type: GraphQLInt,
                resolve: (_, __, {user}) => user ? user.id : null
            },

            username: {
                type: GraphQLString
            },

            isLoggedIn: {
                type: new GraphQLNonNull(GraphQLBoolean),
                resolve: (_, __, {user}) => !!user
            },

            isCurrentUser: {
                type: new GraphQLNonNull(GraphQLBoolean),
                resolve: (_, __, {user}) => !!user
            },

            isAdmin: {
                type: new GraphQLNonNull(GraphQLBoolean),
                resolve: (_, __, {user}) => user ? user.isAdmin : false
            }
        }),

        interfaces: [UserInterfaceType]
    });

    var OtherUserType = new GraphQLObjectType({
        name: 'OtherUser',

        fields: () => ({
            id: {
                type: GraphQLString,
                resolve: ({id}) => {
                    if(id) {
                        return toUserId(id);
                    }
                }
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
            },

            isCurrentUser: {
                type: new GraphQLNonNull(GraphQLBoolean),
                resolve: ({id}, _, user) => false
            }
        }),

        interfaces: [UserInterfaceType]
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
            const trustedIdParsed = fromUserId(trustedId);

            const response = await userAuthorizer.as(context.user).toggleTrust(trustedIdParsed);

            if (response instanceof AuthorizationError) {
                addErrorToResponse(context.responseErrors, 'NotAuthenticated', response);
            }

            return { trustedId: trustedIdParsed };
        }
    });

    const GetCurrentUserMutation = mutationWithClientMutationId({
        name: 'GetCurrentUser',

        inputFields: () => ({}),

        outputFields: () => ({
            currentUser: {
                type: types.CurrentUserType,
                resolve: (payload) => {
                    if (!payload.currentUser)
                        payload.currentUser = {};
                    payload.currentUser.id = CurrentUserType.name;
                    return payload.currentUser;
                }
            },
            rawUser: {
                type: types.UserInterfaceType,
                resolve: (payload) => {
                    return payload.rawUser;
                }
            }
        }),

        mutateAndGetPayload: async (_, context) => {
            let currentUser: any = await userAuthorizer.as(context.user).findCurrentUser();
            let rawUser = Object.assign({}, currentUser);
            return { currentUser, rawUser };
        }
    });

    return Object.assign({}, types, {
        UserInterfaceType,
        CurrentUserType,
        OtherUserType,
        ToggleTrustMutation,
        GetCurrentUserMutation
    });
}

function calculateGravatarUrl(email: string) {
    const hash = MD5(email.toLowerCase().trim());
    return `https://www.gravatar.com/avatar/${hash}`;
}

export function fromUserId(id){
  return parseInt(id.replace('User', ''));
}

export function toUserId(id){
  return 'User' + id;
}
