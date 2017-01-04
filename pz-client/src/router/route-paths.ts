import * as path from 'path';

const routePaths = {
    index: () => '/',
    addReview: () => '/add-review',

    user: {
        signIn: () => path.join(
            routePaths.index(), 'user/sign-in'
        ),

        signUp: () => path.join(
            routePaths.index(), 'user/sign-up'
        )
    },

    communityItem: {
        edit: (id: any) => path.join(
            routePaths.index(), 'edit', id.toString()
        )
    }
};

export default routePaths;
