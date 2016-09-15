import path from 'path';

let appInfo = {
    addresses: {
        getImages: () => '/i/client/assets/images',
        getImage: (imagePath: string) => path.join(appInfo.addresses.getImages(), imagePath),

        getGraphqlApi: () => '/i/graphql',

        getSignInApi: () => '/i/login',
        getSignUpApi: () => '/i/api/Users',

        getSearchSuggestionsApi: () => '/i/search/suggestions',
        getMentionSuggestionsApi: () => '/i/search/mention-suggestions',

        getCommunityItemPhotoUploadApi: () => '/i/upload/community-item/photo'
    }
};

export default appInfo;
