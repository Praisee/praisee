import * as path from 'path';

export type TRoutePathUrlSlug = string | number;

const routePaths = {
    index: () => '/',

    topic: (urlSlug: TRoutePathUrlSlug) => path.join(
        routePaths.index(), urlSlug.toString()
    ),

    communityItem: {
        review: (urlSlug: TRoutePathUrlSlug) => path.join(
            routePaths.index(), 'review', urlSlug.toString()
        ),

        question: (urlSlug: TRoutePathUrlSlug) => path.join(
            routePaths.index(), 'question', urlSlug.toString()
        ),

        howto: (urlSlug: TRoutePathUrlSlug) => path.join(
            routePaths.index(), 'how-to', urlSlug.toString()
        ),

        comparison: (urlSlug: TRoutePathUrlSlug) => path.join(
            routePaths.index(), 'comparison', urlSlug.toString()
        )
    },

    user: {
        profile: (urlSlug: TRoutePathUrlSlug) => path.join(
            routePaths.index(), 'profile/sign-in', urlSlug.toString()
        ),
    }
};

export default routePaths;
