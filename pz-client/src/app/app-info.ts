import * as url from 'url';
import * as path from 'path';

const defaultProtocol = 'http'; // TODO: This should be switched to HTTPS

let appInfo = {
    addresses: {
        getImages: () => '/i/client/assets/images',

        getImage: (imagePath: string) =>
            path.join(appInfo.addresses.getImages(), imagePath),

        getImageFullUrl: (imagePath: string, protocol: string = null) => url.resolve(
            `${protocol ? protocol : defaultProtocol}://` + (
                process.env.NODE_ENV === 'production' ? 'www.praisee.com' : `localhost:3000`
            ),
            appInfo.addresses.getImage(imagePath)
        ),

        getGraphqlApi: () => '/i/graphql',

        getSignInApi: () => '/i/sign-in',
        getSignUpApi: () => '/i/sign-up',
        getSignOutApi: () => '/i/sign-out',
        getFacebookAuthRoute: () => '/i/auth/facebook',
        getFacebookLinkRoute: () => '/i/link/facebook',
        getGoogleAuthRoute: () => '/i/auth/google',
        getGoogleLinkRoute: () => '/i/link/google',

        getSearchSuggestionsApi: () => '/i/search/suggestions',
        getMentionSuggestionsApi: () => '/i/search/mention-suggestions',
        getReviewableTopicSuggestionsApi: () => '/i/search/reviewable-topic-suggestions',

        // TODO: This should be a CDN path
        getPhotosApi: () => process.env.NODE_ENV === 'production' ?
            `${defaultProtocol}://photos.praisee.com` : 'http://localhost:8888',

        getPhoto: (imagePath: string) =>
            url.resolve(appInfo.addresses.getPhotosApi(), imagePath),

        getCommunityItemPhotoUploadApi: () => '/i/upload/community-item/photo',
        getTopicThumbnailPhotoUploadApi: (serverTopicId) => `/i/upload/topic/${Number(serverTopicId)}/thumbnail/photo`
    }
};

export default appInfo;

