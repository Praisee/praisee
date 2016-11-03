import * as url from 'url';
import * as path from 'path';
import serverInfo from 'pz-server/src/app/server-info';

let appInfo = {
    addresses: {
        getImages: () => '/i/client/assets/images',

        getImage: (imagePath: string) =>
            path.join(appInfo.addresses.getImages(), imagePath),

        getImageFullUrl: (imagePath: string, protocol: string = '') => url.resolve(
            `${protocol ? protocol + ':' : ''}//` + (
                serverInfo.isProductionEnv() ? 'www.praisee.com' : `localhost:${serverInfo.getPort()}`
            ),
            appInfo.addresses.getImage(imagePath)
        ),

        getGraphqlApi: () => '/i/graphql',

        getSignInApi: () => '/i/sign-in',
        getSignUpApi: () => '/i/sign-up',
        getSignOutApi: () => '/i/sign-out',

        getSearchSuggestionsApi: () => '/i/search/suggestions',
        getMentionSuggestionsApi: () => '/i/search/mention-suggestions',

        // TODO: This should be a CDN path
        getPhotosApi: () => serverInfo.isProductionEnv() ? '//photos.praisee.com' : 'http://localhost:8888',

        getPhoto: (imagePath: string) =>
            url.resolve(appInfo.addresses.getPhotosApi(), imagePath),

        getCommunityItemPhotoUploadApi: () => '/i/upload/community-item/photo',
        getTopicThumbnailPhotoUploadApi: () => '/i/upload/topic/:topicId/thumbnail/photo',

        // Non-public APIs

        getPhotoServerUploadApi: () => 'http://localhost:8888/image',
    },

    // Non-public APIs
    googleCloud: {
        projectId: () => 'praisee-144100',

        photoServerBucket: () => serverInfo.isProductionEnv() ? 'praisee-photos' : 'praisee-dev-photos'
    }
};

export default appInfo;
