import {IAppRepositoryAuthorizers} from 'pz-server/src/app/repositories';
import * as graphqlRelay from 'graphql-relay';
import * as graphql from 'graphql';

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
    GraphQLUnionType
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
                    type: GraphQLString
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
                    type: GraphQLBoolean
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
                        const cursor = biCursorFromGraphqlArgs(args);

                        const communityItems = await topicsAuthorizer
                            .as(user)
                            .findSomeCommunityItemsRanked(topic.id, cursor);

                        return connectionFromCursorResults(communityItems);
                    }
                },

                communityItemCount: {
                    type: GraphQLInt,
                    resolve: async (topic, args, {user}) => {
                        const count = await topicsAuthorizer
                            .as(user)
                            .getCommunityItemCount(topic.id);

                        return count;
                    }
                },

                routePath: {
                    type: GraphQLString,
                    resolve: async (topic, _, {user}) => {
                        let route = await vanityRoutePathAuthorizer.as(user).findByRecord(topic);
                        return route.routePath;
                    }
                },

                photoGallery: {
                    type: TopicPhotoGalleryPhotoConnection.connectionType,
                    args: connectionArgs,

                    resolve: async (topic, args, {user}) => {
                        const cursor = biCursorFromGraphqlArgs(args);

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
                    types: [types.CommunityItemType],

                    resolveType: (value) => {
                        return types.CommunityItemType;
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
                        mobileThumbnail: {type: new GraphQLNonNull(GraphQLString)}
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
