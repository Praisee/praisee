import * as path from 'path';

export type TRoutePathUrlSlug = string | number;

const routePaths = {
    index: () => '/',

    topic: (urlSlug: TRoutePathUrlSlug) => path.join(
        routePaths.index(), urlSlug.toString()
    ),

    communityItem: (urlSlug: TRoutePathUrlSlug) => path.join(
        routePaths.index(), 'on', urlSlug.toString()
    ),

    user: {
        profile: (urlSlug: TRoutePathUrlSlug) => path.join(
            routePaths.index(), 'profile/sign-in', urlSlug.toString()
        ),
    }
};

export default routePaths;
