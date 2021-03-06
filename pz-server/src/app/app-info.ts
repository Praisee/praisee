import * as url from 'url';
import * as path from 'path';
import serverInfo from 'pz-server/src/app/server-info';

const defaultProtocol = 'http'; // TODO: This should be switched to HTTPS

let appInfo = {
    addresses: {
        getImages: () => '/i/client/assets/images',

        getImage: (imagePath: string) =>
            path.join(appInfo.addresses.getImages(), imagePath),

        getImageFullUrl: (imagePath: string, protocol: string = null) => url.resolve(
            `${protocol ? protocol : defaultProtocol}://` + (
                serverInfo.isProductionEnv() ? 'www.praisee.com' : `localhost:${serverInfo.getPort()}`
            ),
            appInfo.addresses.getImage(imagePath)
        ),

        //TODO: *SECURITY* - Change protocol in prod to https once cert is installed
        getUrlBase: () => serverInfo.isProductionEnv() ? 'http://www.praisee.com' : `http://localhost:${serverInfo.getPort()}`,

        getGraphqlApi: () => '/i/graphql',

        getSignInApi: () => '/i/sign-in',
        getSignUpApi: () => '/i/sign-up',
        getSignOutApi: () => '/i/sign-out',
        getFacebookAuthRoute: () => '/i/auth/facebook',
        getFacebookAuthCallbackRoute: () => '/i/auth/facebook/callback',
        getFacebookLinkRoute: () => '/i/link/facebook',
        getFacebookLinkCallbackRoute: () => '/i/link/facebook/callback',
        getGoogleAuthRoute: () => '/i/auth/google',
        getGoogleAuthCallbackRoute: () => '/i/auth/google/callback',
        getGoogleLinkRoute: () => '/i/link/google',
        getGoogleLinkCallbackRoute: () => '/i/link/google/callback',

        getLoginSuccessRoute: () => '/i/auth-successful',

        getSearchSuggestionsApi: () => '/i/search/suggestions',
        getMentionSuggestionsApi: () => '/i/search/mention-suggestions',
        getReviewableTopicSuggestionsApi: () => '/i/search/reviewable-topic-suggestions',

        // TODO: This should be a CDN path
        getPhotosApi: () => serverInfo.isProductionEnv() ?
            `${defaultProtocol}://photos.praisee.com` : 'http://localhost:8888',

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
