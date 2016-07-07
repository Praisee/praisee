import * as React from 'react';
import * as ReactDomServer from 'react-dom/server';
import {match} from 'react-router'

import routes from 'pz-client/src/router/routes'

// We need to use these dependencies from pz-client, otherwise we'll run into an
// `instanceof` bug.
// See https://github.com/denvned/isomorphic-relay/issues/10#issuecomment-227966031
import * as Relay from 'react-relay';
import IsomorphicRouter from 'isomorphic-relay-router';
import IsomorphicContext from 'pz-client/src/app/isomorphic-context.component';

export function renderApp(response, graphqlNetworkLayer, renderProps, next) {
    (Promise.resolve()
        .then(() => {
            return IsomorphicRouter.prepareData(renderProps, graphqlNetworkLayer);
        })
            
        .then(({data, props}) => {
            const router = IsomorphicRouter.render(props);

            var isomorphicContext = React.createElement(IsomorphicContext, {
                children: router
            });

            response.render('site/layout', {
                cachedRequestData: JSON.stringify(data),
                content: ReactDomServer.renderToString(isomorphicContext)
            });
        })
        
        .catch((error) => next(error))
    );
}

module.exports = function (app: IApp) {
    const GRAPHQL_URL = `http://localhost:3000/i/graphql`; // TODO: Unhardcode this
    const graphqlNetworkLayer = new Relay.DefaultNetworkLayer(GRAPHQL_URL);
    
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
                renderApp(response, graphqlNetworkLayer, renderProps, next);
                
            } else {
                next();
            }
        });
    });
};
