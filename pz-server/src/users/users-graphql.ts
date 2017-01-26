import {
    biCursorFromGraphqlArgs,
    connectionFromCursorResults
} from 'pz-server/src/graphql/cursor-helpers';

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
    let communityItemsAuthorizer = repositoryAuthorizers.communityItems;
    let vanityRoutePathAuthorizer = repositoryAuthorizers.vanityRoutePaths;

    var resolveType = function (value, {user}) {
        if (user && user.id === value.id) {
            return CurrentUserType;
        }
        else {
            return OtherUserType;
        }
    };

    const resolveSlugPath = async (user, _, {user: currentUser}) => {
        user.recordType = 'PraiseeUser';
        let route = await vanityRoutePathAuthorizer.as(currentUser).findByRecord(user);

        return route.routePath;
    };

    var UserInterfaceType = new GraphQLInterfaceType({
        name: 'UserInterface',

        fields: () => ({
            id: { type: GraphQLString },

            displayName: { type: GraphQLString },

            reputation: { type: GraphQLInt },

            image: { type: GraphQLString },

            trusterCount: { type: GraphQLInt },

            isCurrentUser: { type: new GraphQLNonNull(GraphQLBoolean) },

            routePath: { type: GraphQLString }
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

            displayName: { type: GraphQLString },

            email: { type: GraphQLString },

            username: { type: GraphQLString },

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
            },

            routePath: {
                type: GraphQLString,
                resolve: resolveSlugPath
            }
        }),

        interfaces: [UserInterfaceType]
    });

    var OtherUserType = new GraphQLObjectType({
        name: 'OtherUser',

        fields: () => ({
            id: { type: GraphQLString },

            displayName: { type: GraphQLString },

            image: {
                type: GraphQLString,
                resolve: ({email}) => calculateGravatarUrl(email)
            },

            reputation: {
                type: GraphQLInt,
                resolve: ({id}, _, {user}) => userAuthorizer.as(user).getReputation(id)
            },

            trusterCount: {
                type: GraphQLInt,
                resolve: ({id}, _, {user}) => userAuthorizer.as(user).getTotalTrusters(id)
            },

            isCurrentUserTrusting: {
                type: GraphQLBoolean,
                resolve: ({id}, _, {user}) => userAuthorizer.as(user).isUserTrusting(id)
            },

            isCurrentUser: {
                type: new GraphQLNonNull(GraphQLBoolean),
                resolve: ({id}, _, user) => false
            },

            routePath: {
                type: GraphQLString,
                resolve: resolveSlugPath
            }
        }),

        interfaces: [UserInterfaceType]
    });

    var UserProfileType = new GraphQLObjectType({
        name: 'UserProfile',

        fields: () => ({
            id: globalIdField(UserProfileType.Name),

            bio: { type: GraphQLString },

            createdAt: { type: GraphQLString },

            user: {
                type: UserInterfaceType,
                resolve: (user) => user
            },

            communityItemCount: {
                type: GraphQLInt,
                resolve: (user) => 10
            },

            activityStats: {
                type: new GraphQLObjectType({
                    name: 'ActivityStats',
                    fields: {
                        comments: { type: GraphQLInt },
                        communityItems: { type: GraphQLInt },
                        upVotes: { type: GraphQLInt },
                        downVotes: { type: GraphQLInt },
                        trusts: { type: GraphQLInt },
                        reputation: { type: GraphQLInt }
                    }
                }),
                resolve: async (user, _, {user: currentUser}) => {
                    let stats = await userAuthorizer.as(currentUser).getActivityStats(user.id);

                    return stats;
                }
            },

            communityItems: {
                type: types.CommunityItemConnection.connectionType,
                args: connectionArgs,

                resolve: async ({id}, args, {user}) => {
                    const cursor = biCursorFromGraphqlArgs(args as any);
                    let items = await communityItemsAuthorizer
                        .as(user)
                        .findSomeByUserId(cursor, id);

                    return connectionFromCursorResults(
                        items
                    );
                }
            }
        })
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
        UserProfileType,
        ToggleTrustMutation,
        GetCurrentUserMutation
    });
}

function calculateGravatarUrl(email: string) {
    const hash = MD5(email.toLowerCase().trim());
    return `https://www.gravatar.com/avatar/${hash}`;
}

export function fromUserId(id) {
    return parseInt(id.replace('User', ''));
}

export function toUserId(id) {
    return 'User' + id;
}
