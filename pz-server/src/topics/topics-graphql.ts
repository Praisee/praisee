import {IAppRepositoryAuthorizers} from 'pz-server/src/app/repositories';

import {
    GraphQLBoolean,
    GraphQLID,
    GraphQLInt,
    GraphQLFloat,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLInputObjectType,
    GraphQLSchema,
    GraphQLString,
    GraphQLUnionType
} from 'graphql';

import {
    connectionDefinitions,
    fromGlobalId,
    nodeDefinitions,
    connectionArgs,
    globalId,
    connectionFromArray,
    connectionFromPromisedArray,
    globalIdField,
    mutationWithClientMutationId
} from 'graphql-relay';

import {
    biCursorFromGraphqlArgs,
    connectionFromCursorResults
} from 'pz-server/src/graphql/cursor-helpers';

import {ITypes} from 'pz-server/src/graphql/types';

import {
    getTopicThumbnailPhotoVariationsUrls,
    getTopicPhotoGalleryPhotoVariationsUrls
} from 'pz-server/src/photos/photo-variations';

import {mapCursorResultItems} from 'pz-server/src/support/cursors/map-cursor-results';

import {IAuthorizedVanityRoutePaths} from 'pz-server/src/vanity-route-paths/vanity-route-paths-authorizer';
import {IAuthorizer} from 'pz-server/src/support/authorization';
import {communityItemTypeResolver} from 'pz-server/src/community-items/community-items-graphql';

export default function topicTypes(repositoryAuthorizers: IAppRepositoryAuthorizers, nodeInterface, types: ITypes) {
    const topicsAuthorizer = repositoryAuthorizers.topics;
    const communityItemsAuthorizer = repositoryAuthorizers.communityItems;
    const topicAttributesAuthorizer = repositoryAuthorizers.topicAttributes;
    const vanityRoutePathAuthorizer = repositoryAuthorizers.vanityRoutePaths;

    const TopicType = new GraphQLObjectType({
        name: 'Topic',

        fields: () => {
            return ({
                id: globalIdField('Topic'),

                serverId: {
                    type: new GraphQLNonNull(GraphQLInt),
                    resolve: (topic) => topic.id
                },

                name: {
                    type: new GraphQLNonNull(GraphQLString)
                },

                description: {
                    type: GraphQLString
                },

                thumbnailPhoto: {
                    type: TopicThumbnailPhotoType,

                    resolve: (topic) => {
                        if (!topic.thumbnailPhotoPath) {
                            return null;
                        }

                        return getTopicThumbnailPhotoVariationsUrls(
                            topic.thumbnailPhotoPath
                        );
                    }
                },

                overviewContent: {
                    type: GraphQLString
                },

                isVerified: {
                    type: new GraphQLNonNull(GraphQLBoolean)
                },

                isCategory: {
                    type: new GraphQLNonNull(GraphQLBoolean)
                },

                attributes: {
                    type: new GraphQLNonNull(new GraphQLList(types.TopicAttributeInterfaceType)),

                    resolve: async (topic, _, {user}) => topicAttributesAuthorizer
                        .as(user)
                        .findAllByTopicId(topic.id)
                },

                communityItems: {
                    type: types.CommunityItemConnection.connectionType,
                    args: connectionArgs,

                    resolve: async (topic, args, {user}) => {
                        const cursor = biCursorFromGraphqlArgs(args as any);

                        const communityItems = await topicsAuthorizer
                            .as(user)
                            .findSomeCommunityItemsRanked(topic.id, cursor);

                        return connectionFromCursorResults(communityItems);
                    }
                },

                communityItemCount: {
                    type: new GraphQLNonNull(GraphQLInt),
                    resolve: async (topic, args, {user}) => {
                        const count = await topicsAuthorizer
                            .as(user)
                            .getCommunityItemCount(topic.id);

                        return count;
                    }
                },

                routePath: createRoutePathType(vanityRoutePathAuthorizer),
                reviewsRoutePath: createRoutePathType(vanityRoutePathAuthorizer, 'reviewsRoutePath'),
                questionsRoutePath: createRoutePathType(vanityRoutePathAuthorizer, 'questionsRoutePath'),
                guidesRoutePath: createRoutePathType(vanityRoutePathAuthorizer, 'guidesRoutePath'),
                comparisonsRoutePath: createRoutePathType(vanityRoutePathAuthorizer, 'comparisonsRoutePath'),

                photoGallery: {
                    type: TopicPhotoGalleryPhotoConnection.connectionType,
                    args: connectionArgs,

                    resolve: async (topic, args, {user}) => {
                        const cursor = biCursorFromGraphqlArgs(args as any);

                        const photoGalleryPhotos = await topicsAuthorizer
                            .as(user)
                            .findSomePhotoGalleryPhotosRanked(topic.id, cursor);

                        const photoGalleryPhotosUrls = mapCursorResultItems(photoGalleryPhotos, (photo) => {
                            return Object.assign({}, photo,
                                getTopicPhotoGalleryPhotoVariationsUrls(photo.photoServerPath)
                            );
                        });

                        return connectionFromCursorResults(photoGalleryPhotosUrls);
                    }
                },

                topTenReviewedSubTopics: {
                    type: new GraphQLList(types.TopicType),

                    resolve: (topic, __, {user}) => {
                        if (!topic.isCategory) {
                            return null;
                        }

                        return topicsAuthorizer
                            .as(user)
                            .findTopTenReviewedTopicsByCategoryId(topic.id);
                    }
                },

                ratingForViewer: {
                    type: GraphQLFloat,

                    resolve: async (topic, _, {user}) => {
                        // TODO: Use a user-personalized rating
                        return topicsAuthorizer
                            .as(user)
                            .getAverageRatingById(topic.id);
                    }
                }
            });
        },

        interfaces: [nodeInterface]
    });

    const TopicThumbnailPhotoType = new GraphQLObjectType({
        name: 'TopicThumbnailPhoto',

        fields: () => ({
            defaultUrl: {type: new GraphQLNonNull(GraphQLString)},

            variations: {
                type: new GraphQLObjectType({
                    name: 'TopicThumbnailPhotoVariations',
                    fields: {
                        initialLoad: {type: new GraphQLNonNull(GraphQLString)},
                        mobile: {type: new GraphQLNonNull(GraphQLString)}
                    }
                })
            }
        })
    });

    const TopicPhotoGalleryPhotoType = new GraphQLObjectType({
        name: 'TopicPhotoGalleryPhoto',

        fields: () => ({
            parent: {
                type: new GraphQLNonNull(new GraphQLUnionType({
                    name: 'TopicPhotoGalleryPhotoParent',
                    types: [
                        ...Object.keys(types.communityItemTypes).map(
                            type => types.communityItemTypes[type]
                        )
                    ],

                    resolveType: (value) => {
                        return communityItemTypeResolver(types, value);
                    }
                })),

                resolve: (value, _, {user}) => communityItemsAuthorizer
                    .as(user).findById(value.parentId)
            },

            defaultUrl: {type: new GraphQLNonNull(GraphQLString)},

            variations: {
                type: new GraphQLObjectType({
                    name: 'TopicPhotoGalleryPhotoVariations',
                    fields: {
                        initialLoad: {type: new GraphQLNonNull(GraphQLString)},
                        mobile: {type: new GraphQLNonNull(GraphQLString)},

                        thumbnail: {type: new GraphQLNonNull(GraphQLString)},
                        mobileThumbnail: {type: new GraphQLNonNull(GraphQLString)},

                        square: {type: new GraphQLNonNull(GraphQLString)},
                        mobileSquare: {type: new GraphQLNonNull(GraphQLString)}
                    }
                })
            }
        })
    });

    const TopicPhotoGalleryPhotoConnection = connectionDefinitions({
        name: 'TopicPhotoGalleryPhoto',
        nodeType: TopicPhotoGalleryPhotoType
    });

    return {
        TopicType,
        TopicThumbnailPhotoType,
        TopicPhotoGalleryPhotoType
    };
}

function createRoutePathType(
        vanityRoutePathAuthorizer: IAuthorizer<IAuthorizedVanityRoutePaths>,
        routePathType: string = 'routePath'
    ) {

    return {
        type: new GraphQLNonNull(GraphQLString),
        resolve: async (topic, _, {user}) => {
            const route = await vanityRoutePathAuthorizer.as(user).findByTopic(topic);
            return route[routePathType];
        }
    }
}

export function getTopicLookupField(repositoryAuthorizers: IAppRepositoryAuthorizers, types: ITypes) {
    return {
        type: types.TopicType,

        args: {
            serverId: {
                type: GraphQLInt
            },

            urlSlug: {
                type: GraphQLString
            }
        },

        resolve: async (_, {serverId, urlSlug}, {user}) => {
            if (!serverId && !urlSlug) {
                return null;
            }

            const topics = repositoryAuthorizers.topics.as(user);

            if (serverId) {
                return await topics.findById(serverId);

            } else {

                return await topics.findByUrlSlugName(urlSlug);
            }
        }
    };
}

export function getTopicsField(repositoryAuthorizers: IAppRepositoryAuthorizers, types: ITypes) {
    const topicsAuthorizer = repositoryAuthorizers.topics;

    return {
        type: new GraphQLList(types.TopicType),
        resolve: (_, __, {user}) => topicsAuthorizer.as(user).findAll()
    };
}

export function getTopTenCategoriesByReviewsField(repositoryAuthorizers: IAppRepositoryAuthorizers, types: ITypes) {
    const topicsAuthorizer = repositoryAuthorizers.topics;

    return {
        type: new GraphQLList(types.TopicType),
        resolve: (_, __, {user}) => topicsAuthorizer.as(user).findTopTenCategoriesByReviews()
    };
}
