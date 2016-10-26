import {
    GraphQLBoolean,
    GraphQLID,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLInputObjectType,
    GraphQLSchema,
    GraphQLString,
    GraphQLEnumType
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

import {IAppRepositoryAuthorizers} from 'pz-server/src/app/repositories';
import {ITypes} from 'pz-server/src/graphql/types';
import {
    getStaticPhotoVariationsUrls,
    IStaticPhotoVariations
} from './photo-variations';
import appInfo from '../app/app-info';

interface IStaticPhotoConfig {
    path: string
}

interface IStaticPhotosConfig {
    [name: string]: IStaticPhotoConfig
}

const staticPhotosConfig: IStaticPhotosConfig = {
    electronics: {path: 'topics/electronics.jpg'},
    cosmetics: {path: 'topics/cosmetics.jpg'},
    homeGarden: {path: 'topics/home-garden.jpg'},
    photography: {path: 'topics/photography.jpg'},
    artsCrafts: {path: 'topics/arts-crafts.jpg'},
    outdoors: {path: 'topics/outdoors.jpg'},
};

export function getStaticPhotosTypes(types: ITypes) {
    const StaticPhotoType = new GraphQLObjectType({
        name: 'StaticPhoto',

        fields: () => ({
            name: {type: new GraphQLNonNull(GraphQLString)},

            defaultUrl: {type: new GraphQLNonNull(GraphQLString)},

            variations: {
                type: new GraphQLObjectType({
                    name: 'StaticPhotoVariations',
                    fields: {
                        initialLoad: {type: new GraphQLNonNull(GraphQLString)},
                        mobile: {type: new GraphQLNonNull(GraphQLString)},

                        mediumFit: {type: new GraphQLNonNull(GraphQLString)},
                        mediumFitMobile: {type: new GraphQLNonNull(GraphQLString)},
                    }
                })
            }
        })
    });

    return {
        StaticPhotoType
    };
}

export function getStaticPhotosField(types: ITypes) {
    return {
        type: new GraphQLNonNull(new GraphQLList(types.StaticPhotoType)),

        resolve: () => {
            return Object.keys(staticPhotosConfig).map(staticPhotoName => {
                const config = staticPhotosConfig[staticPhotoName];

                return Object.assign({}, getPhotoVariationUrls(config), {
                    name: staticPhotoName
                });
            });
        }
    }
}

function getPhotoVariationUrls(staticPhotoConfig: IStaticPhotoConfig): IStaticPhotoVariations {
    return getStaticPhotoVariationsUrls(staticPhotoConfig.path);
}
