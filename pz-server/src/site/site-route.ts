import {match} from 'react-router'
import routes from 'pz-client/src/router/routes'
import renderApp from 'pz-server/src/site/render-app';

module.exports = function (app: IApp) {
    app.get('*', function (request, response, next) {
        if (request.path.match(/^\/?.\//i)) {
            next(); // Single letter routes are reserved
            return;
        }

        match({ routes, location: request.url }, (error, redirectLocation, renderProps: any) => {
            if (error) {
                next(error);

            } else if (redirectLocation) {
                response.redirect(302, redirectLocation.pathname + redirectLocation.search)

            } else if (renderProps) {
                renderApp(request, response, renderProps, next);

            } else {
                next();
            }
        });
    });
};
