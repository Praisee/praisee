import * as url from 'url';
import * as path from 'path';

let appInfo = {
    addresses: {
        getImages: () => '/i/client/assets/images',

        getImage: (imagePath: string) =>
            path.join(appInfo.addresses.getImages(), imagePath),

        getGraphqlApi: () => '/i/graphql',

        getSignInApi: () => '/i/sign-in',
        getSignUpApi: () => '/i/sign-up',
        getSignOutApi: () => '/i/sign-out',

        getSearchSuggestionsApi: () => '/i/search/suggestions',
        getMentionSuggestionsApi: () => '/i/search/mention-suggestions',
        getReviewableTopicSuggestionsApi: () => '/i/search/reviewable-topic-suggestions',

        // TODO: This should be a CDN path
        getPhotosApi: () => process.env.NODE_ENV === 'production' ? '//photos.praisee.com' : 'http://localhost:8888',

        getPhoto: (imagePath: string) =>
            url.resolve(appInfo.addresses.getPhotosApi(), imagePath),

        getCommunityItemPhotoUploadApi: () => '/i/upload/community-item/photo',
        getTopicThumbnailPhotoUploadApi: (serverTopicId) => `/i/upload/topic/${Number(serverTopicId)}/thumbnail/photo`
    }
};

export default appInfo;

