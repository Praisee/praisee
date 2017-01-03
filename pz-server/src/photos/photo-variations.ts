import appInfo from 'pz-server/src/app/app-info';
import serverInfo from 'pz-server/src/app/server-info';
import pzPath from 'pz-support/src/pz-path';
import * as fs from 'fs';

var ThumborUrlBuilder = require('thumbor-url-builder');

var securityKey;

if (serverInfo.isProductionEnv()) {
    securityKey = fs.readFileSync(pzPath('pz-server', 'src/photos/photo-server/security.prod.key'), 'utf8').trim();
} else {
    securityKey = fs.readFileSync(pzPath('pz-server', 'src/photos/photo-server/security.dev.key'), 'utf8').trim();
}

function getPhotoBuilderFactory(photoServerPath) {
    return () =>  {
        const thumborUrlBuilder = new ThumborUrlBuilder(securityKey, appInfo.addresses.getPhotosApi());
        return thumborUrlBuilder.setImagePath(photoServerPath).filter('format(jpg)');
    };
}

export interface ICommonPhotoVarations {
    defaultUrl: string

    variations: {
        initialLoad: string
        mobile: string
    }
}

export interface ITopicThumbnailPhotoVariations extends ICommonPhotoVarations {}

export function getTopicThumbnailPhotoVariationsUrls(photoServerPath): ITopicThumbnailPhotoVariations {
    const getPhotoBuilder = getPhotoBuilderFactory(photoServerPath);

    return {
        defaultUrl: getPhotoBuilder().smartCrop(true).resize(500, 500).buildUrl(),

        variations: {
            initialLoad: getPhotoBuilder().resize(1, 1).filter('blur(1000)').buildUrl(),
            mobile: getPhotoBuilder().smartCrop(true).resize(100, 100).buildUrl()
        }
    };
}

export interface ITopicPhotoGalleryPhotoVariations extends ICommonPhotoVarations {
    defaultUrl: string

    variations: {
        initialLoad: string
        mobile: string

        thumbnail: string
        mobileThumbnail: string

        square: string
        mobileSquare: string
    }
}

export function getTopicPhotoGalleryPhotoVariationsUrls(photoServerPath): ITopicPhotoGalleryPhotoVariations {
    const getPhotoBuilder = getPhotoBuilderFactory(photoServerPath);

    return {
        defaultUrl: getPhotoBuilder().smartCrop(true).fitIn(1000, 1000).buildUrl(),

        variations: {
            initialLoad: getPhotoBuilder().resize(1, 1).filter('blur(1000)').buildUrl(),
            mobile: getPhotoBuilder().smartCrop(true).fitIn(400, 400).buildUrl(),

            thumbnail: getPhotoBuilder().smartCrop(true).fitIn(300, 300).buildUrl(),
            mobileThumbnail: getPhotoBuilder().smartCrop(true).fitIn(75, 75).buildUrl(),

            square: getPhotoBuilder().smartCrop(true).resize(500, 500).buildUrl(),
            mobileSquare: getPhotoBuilder().smartCrop(true).resize(100, 100).buildUrl()
        }
    };
}

export interface ICommunityItemContentPhotoVariations extends ICommonPhotoVarations {}

export function getCommunityItemContentPhotoVariationsUrls(photoServerPath): ICommunityItemContentPhotoVariations {
    const getPhotoBuilder = getPhotoBuilderFactory(photoServerPath);

    return {
        defaultUrl: getPhotoBuilder().smartCrop(true).fitIn(1000, 1000).buildUrl(),

        variations: {
            initialLoad: getPhotoBuilder().resize(1, 1).filter('blur(1000)').buildUrl(),
            mobile: getPhotoBuilder().smartCrop(true).fitIn(400, 400).buildUrl()
        }
    };
}

export interface IStaticPhotoVariations extends ICommonPhotoVarations {
    variations: {
        initialLoad: string
        mobile: string

        mediumFit: string
        mediumFitMobile: string
    }
}

export function getStaticPhotoVariationsUrls(staticPhotoUrl): IStaticPhotoVariations {
    const getPhotoBuilder = getPhotoBuilderFactory(staticPhotoUrl);

    return {
        defaultUrl: getPhotoBuilder().fitIn(1000, 1000).buildUrl(),

        variations: {
            initialLoad: getPhotoBuilder().resize(1, 1).filter('blur(1000)').buildUrl(),
            mobile: getPhotoBuilder().fitIn(400, 400).buildUrl(),

            mediumFit: getPhotoBuilder().fitIn(400, 400).buildUrl(),
            mediumFitMobile: getPhotoBuilder().fitIn(200, 200).buildUrl(),
        }
    };
}
