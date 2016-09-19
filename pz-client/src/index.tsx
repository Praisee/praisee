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
import appInfo from 'pz-client/src/app/app-info';
import ClientAppRouterContainer from 'pz-client/src/app/client-app-router-container';

function createRelayEnvironment() {
    const environment = new Relay.Environment();

    environment.injectNetworkLayer(
        new Relay.DefaultNetworkLayer(appInfo.addresses.getGraphqlApi(), {
            credentials: 'same-origin',
        })
    );

    return environment;
}


function renderApp() {
    const initialEnvironment = createRelayEnvironment();

    IsomorphicRelay.injectPreparedData(initialEnvironment, getCachedRequestData() || []);

    ReactRouter.match({routes, history: ReactRouter.browserHistory}, (error, redirectLocation, renderProps) => {
        IsomorphicRouter.prepareInitialRender(initialEnvironment, renderProps).then(props => {
            const TypeSafetyNoMoreIsomorphicContext: any = IsomorphicContext;

            ReactDom.render(
                (
                    <TypeSafetyNoMoreIsomorphicContext>
                        <ClientAppRouterContainer
                            routerProps={props}
                            createRelayEnvironment={createRelayEnvironment}
                        />
                    </TypeSafetyNoMoreIsomorphicContext>
                ),
                document.querySelector('.app-container')
            );
        });
    });
}

renderApp();
