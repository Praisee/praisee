import appInfo from 'pz-server/src/app/app-info';
import {IAppRepositoryAuthorizers} from 'pz-server/src/app/repositories';

var passport = require('passport');

module.exports = function signUpRoute(app: IApp) {
    const repositoryAuthorizers: IAppRepositoryAuthorizers = app.services.repositoryAuthorizers;

    app.post(appInfo.addresses.getSignUpApi(), async (request, response, next) => {
        const {email, password, displayName} = request.body;

        try {
            await repositoryAuthorizers
                .users
                .as(request.user)
                .create(email, password, displayName);

        } catch(error) {
            return next(error);
        }

        const authenticated = (error, user) => {
            request.login(user, (error) => {
                if (error) {
                    return next(error);
                }

                const user = request.user;

                response.json({
                    success: true,
                    user: {
                        id: user.id,
                        username: user.username,
                        emails: user.emails
                    }
                });

            });
        };

        passport.authenticate('local', authenticated)(request, response, next);
    });
};
