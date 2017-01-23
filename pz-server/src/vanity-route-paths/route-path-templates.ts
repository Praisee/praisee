import * as path from 'path';

export type TRoutePathUrlSlug = string | number;

const routePaths = {
    index: () => '/',

    // topic: (urlSlug: TRoutePathUrlSlug) => path.join(
    //     routePaths.index(), urlSlug.toString()
    // ),

    topic: {
        index: (urlSlug: TRoutePathUrlSlug) => path.join(
            routePaths.index(), urlSlug.toString()
        ),

        reviews: (urlSlug: TRoutePathUrlSlug) => path.join(
            routePaths.index(), urlSlug.toString() + '-reviews'
        ),

        questions: (urlSlug: TRoutePathUrlSlug) => path.join(
            routePaths.index(), urlSlug.toString() + '-questions'
        ),

        guides: (urlSlug: TRoutePathUrlSlug) => path.join(
            routePaths.index(), urlSlug.toString() + '-guides'
        ),

        comparisons: (urlSlug: TRoutePathUrlSlug) => path.join(
            routePaths.index(), urlSlug.toString() + '-comparisons'
        )
    },

    communityItem: (urlSlug: TRoutePathUrlSlug) => path.join(
        routePaths.index(), 'on', urlSlug.toString()
    ),

    user: {
        profile: (urlSlug: TRoutePathUrlSlug) => path.join(
            routePaths.index(), 'profile', urlSlug.toString()
        ),
    }
};

export default routePaths;
