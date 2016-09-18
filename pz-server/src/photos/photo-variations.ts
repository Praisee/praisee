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

export interface IPhotoVariations {
    defaultUrl: string

    variations: {
        initialLoad: string
        mobile: string
    }
}

export function getPhotoVariationsUrls(photoServerPath): IPhotoVariations {
    const getPhotoBuilder = () => {
        const thumborUrlBuilder = new ThumborUrlBuilder(securityKey, appInfo.addresses.getPhotosApi());
        return thumborUrlBuilder.setImagePath(photoServerPath).filter('format(jpg)');
    };
    
    return {
        defaultUrl: getPhotoBuilder().smartCrop(true).fitIn(1000, 1000).buildUrl(),

        variations: {
            initialLoad: getPhotoBuilder().resize(1, 1).filter('blur(1000)').buildUrl(),
            mobile: getPhotoBuilder().smartCrop(true).fitIn(400, 400).buildUrl()
        }
    };
}
