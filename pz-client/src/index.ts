import * as React from 'react';
import * as Relay from 'react-relay';
import * as ReactRouter from 'react-router';
import * as useRelay from 'react-router-relay';
import * as ReactDom from 'react-dom';
import routes from 'pz-client/src/router/routes';
import 'isomorphic-fetch';
import IsomorphicContext from 'pz-client/src/app/isomorphic-context.component';

Relay.injectNetworkLayer(
    new Relay.DefaultNetworkLayer('/i/graphql')
);

var router = React.createElement<any>(ReactRouter.Router, {
    routes: routes,
    history: ReactRouter.browserHistory,
    render: ReactRouter.applyRouterMiddleware(useRelay),
    environment: Relay.Store
});

var isomorphicContext = React.createElement(IsomorphicContext, {
    children: router
});

ReactDom.render(isomorphicContext, document.querySelector('.app-container'));
