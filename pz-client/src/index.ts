import 'isomorphic-fetch';
import * as React from 'react';
import * as Relay from 'react-relay';
import * as ReactRouter from 'react-router';
import IsomorphicRelay from 'isomorphic-relay';
import IsomorphicRouter from 'isomorphic-relay-router';
import * as ReactDom from 'react-dom';
import routes from 'pz-client/src/router/routes';
import IsomorphicContext from 'pz-client/src/app/isomorphic-context.component';
import {getCachedRequestData} from 'pz-client/src/support/page-globals';

const environment = new Relay.Environment();

environment.injectNetworkLayer(
    new Relay.DefaultNetworkLayer('/i/graphql', {
        credentials: 'same-origin',
    })
);

IsomorphicRelay.injectPreparedData(environment, getCachedRequestData() || []);

ReactRouter.match({routes, history: ReactRouter.browserHistory}, (error, redirectLocation, renderProps) => {
    IsomorphicRouter.prepareInitialRender(environment, renderProps).then(props => {
        var router = React.createElement<any>(ReactRouter.Router, props);

        var isomorphicContext = React.createElement(IsomorphicContext, {
            children: router
        });

        ReactDom.render(
            isomorphicContext,
            document.querySelector('.app-container')
        );
    });
});
