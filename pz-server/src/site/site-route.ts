import * as React from 'react';
import * as ReactDomServer from 'react-dom/server';
import { match, RouterContext } from 'react-router'

import routes from 'pz-client/src/routes'

export default function (app: IApp) {
    app.get('*', function (request, response, next) {
        if (request.path.match(/^\/?.\//i)) {
            next(); // Single letter routes are reserved
            return;
        }
        
        match({ routes, location: request.url }, (error, redirectLocation, renderProps: any) => {
            if (error) {
                response.status(500).send(error.message)
            } else if (redirectLocation) {
                response.redirect(302, redirectLocation.pathname + redirectLocation.search)
            } else if (renderProps) {
                response.render('site/layout', {
                    content: ReactDomServer.renderToString(React.createElement(RouterContext, renderProps))
                });
            } else {
                next();
            }
        });
    });
}
