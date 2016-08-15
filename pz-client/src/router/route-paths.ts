import * as path from 'path';

const routePaths = {
    index: () => '/',

    user: {
        signIn: () => path.join(
            routePaths.index(), 'user/sign-in'
        ),

        signUp: () => path.join(
            routePaths.index(), 'user/sign-up'
        )
    }
};

export default routePaths;
