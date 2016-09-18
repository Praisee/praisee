import * as url from 'url';
import * as path from 'path';

// This is currently being consumed by pz-client, so sensitive information should
// not be put in here.

let appInfo = {
    addresses: {
        getImages: () => '/i/client/assets/images',

        getImage: (imagePath: string) =>
            path.join(appInfo.addresses.getImages(), imagePath),

        getGraphqlApi: () => '/i/graphql',

        getSignInApi: () => '/i/login',
        getSignUpApi: () => '/i/api/Users',

        getSearchSuggestionsApi: () => '/i/search/suggestions',
        getMentionSuggestionsApi: () => '/i/search/mention-suggestions',

        getPhotosApi: () => 'http://localhost:8888',

        getPhoto: (imagePath: string) =>
            url.resolve(appInfo.addresses.getPhotosApi(), imagePath),

        getCommunityItemPhotoUploadApi: () => '/i/upload/community-item/photo'
    }
};

export default appInfo;
