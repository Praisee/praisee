import * as React from 'react';
import * as Relay from 'react-relay';
import * as ReactRouter from 'react-router';
import * as ReactDom from 'react-dom';
import routes from 'pz-client/src/routes';
import 'isomorphic-fetch';
import IsomorphicContext from 'pz-client/src/app/isomorphic-context.component';

Relay.injectNetworkLayer(
    new Relay.DefaultNetworkLayer('/i/graphql')
);

var router = React.createElement(ReactRouter.Router, {
    routes: routes,
    history: ReactRouter.browserHistory
});

var relayRenderer = (rootContainer) => React.createElement(Relay.Renderer, {
    Container: rootContainer,

    environment: Relay.Store,

    queryConfig: {
        name: 'AppRoute',

        params: {},

        queries: {
            viewer: () => Relay.QL`
                query {
                    viewer
                }
            `
        }
    }
});

var isomorphicContext = React.createElement(IsomorphicContext, {
    relayRenderer,
    children: router
});

ReactDom.render(isomorphicContext, document.querySelector('.app-container'));
