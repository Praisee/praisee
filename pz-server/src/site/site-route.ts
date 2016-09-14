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
import {startBenchmark, endBenchmark} from 'pz-server/src/support/benchmark';
import serverInfo from 'pz-server/src/app/server-info';

const GRAPHQL_URL = `http://${serverInfo.getHost()}/i/graphql`; // TODO: Unhardcode this

export function renderApp(request, response, renderProps, next) {
    if (process.env.NO_ISOMORPHIC) {
        response.render('site/layout', {
            cache: true,
            cachedRequestData: 'null',
            content: ''
        });

        return;
    }

    const graphqlNetworkLayer = new Relay.DefaultNetworkLayer(GRAPHQL_URL, {
        headers: request.headers
    });

    let dataPrepBenchmark;

    (Promise.resolve()
        .then(() => {
            dataPrepBenchmark = startBenchmark('Prepare Relay Data');
            return IsomorphicRouter.prepareData(renderProps, graphqlNetworkLayer);
        })

        .then(({data, props}) => {
            endBenchmark(dataPrepBenchmark);

            const router = IsomorphicRouter.render(props);

            let hasError = false;

            var isomorphicContext = React.createElement(IsomorphicContext, {
                children: router,

                notFoundHandler: () => {
                    hasError = true;
                }
            });

            let renderBenchmark = startBenchmark('Render React Site Content');

            const content = ReactDomServer.renderToString(isomorphicContext);

            endBenchmark(renderBenchmark);

            if (!hasError) {
                response.render('site/layout', {
                    cache: true,
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
