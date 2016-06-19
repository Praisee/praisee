import * as React from 'react';
import * as ReactDomServer from 'react-dom/server';
import { match, RouterContext } from 'react-router'
import IsomorphicContext from 'pz-client/src/app/isomorphic-context.component';

import routes from 'pz-client/src/routes'

export function renderApp(app: IApp, renderProps: any) {
    const routerContext = React.createElement(RouterContext, renderProps);
    
    var isomorphicContext = React.createElement(IsomorphicContext, {
        children: routerContext,
        loopbackApp: app
    });
    
    return ReactDomServer.renderToString(isomorphicContext);
}

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
                    content: renderApp(app, renderProps)
                });
                
            } else {
                next();
            }
        });
    });
}
