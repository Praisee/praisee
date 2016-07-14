import * as React from 'react';
import * as ReactDomServer from 'react-dom/server';
import { match } from 'react-router';
import routes from 'pz-client/src/router/routes';
import * as Relay from 'react-relay';
import IsomorphicRouter from 'isomorphic-relay-router';
import IsomorphicContext from 'pz-client/src/app/isomorphic-context.component';
var GRAPHQL_URL = "http://localhost:3000/i/graphql";
export function renderApp(request, response, renderProps, next) {
    var graphqlNetworkLayer = new Relay.DefaultNetworkLayer(GRAPHQL_URL, {
        headers: request.headers
    });
    (Promise.resolve()
        .then(function () {
        return IsomorphicRouter.prepareData(renderProps, graphqlNetworkLayer);
    })
        .then(function (_a) {
        var data = _a.data, props = _a.props;
        var router = IsomorphicRouter.render(props);
        var isomorphicContext = React.createElement(IsomorphicContext, {
            children: router
        });
        response.render('site/layout', {
            cachedRequestData: JSON.stringify(data),
            content: ReactDomServer.renderToString(isomorphicContext)
        });
    })
        .catch(function (error) { return next(error); }));
}
module.exports = function (app) {
    app.get('*', function (request, response, next) {
        if (request.path.match(/^\/?.\//i)) {
            next();
            return;
        }
        match({ routes: routes, location: request.url }, function (error, redirectLocation, renderProps) {
            if (error) {
                next(error);
            }
            else if (redirectLocation) {
                response.redirect(302, redirectLocation.pathname + redirectLocation.search);
            }
            else if (renderProps) {
                renderApp(request, response, renderProps, next);
            }
            else {
                next();
            }
        });
    });
};
