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

const GRAPHQL_URL = `http://localhost:3000/i/graphql`; // TODO: Unhardcode this

export function renderApp(request, response, renderProps, next) {
    if (process.env.NO_ISOMORPHIC) {
        response.render('site/layout', {
            cachedRequestData: 'null',
            content: ''
        });
    }

    const graphqlNetworkLayer = new Relay.DefaultNetworkLayer(GRAPHQL_URL, {
        headers: request.headers
    });

    (Promise.resolve()
        .then(() => {
            return IsomorphicRouter.prepareData(renderProps, graphqlNetworkLayer);
        })

        .then(({data, props}) => {
            const router = IsomorphicRouter.render(props);

            let hasError = false;

            var isomorphicContext = React.createElement(IsomorphicContext, {
                children: router,

                notFoundHandler: () => {
                    hasError = true;
                }
            });

            const content = ReactDomServer.renderToString(isomorphicContext);

            if (!hasError) {
                response.render('site/layout', {
                    cachedRequestData: JSON.stringify(data),
                    content: content
                });

            } else {

                next();
            }
        })

        .catch((error) => {
            if (error.response && error.response.text) {
                error.response.text().then(console.error);
            }

            next(error);
        })
    );
}

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
