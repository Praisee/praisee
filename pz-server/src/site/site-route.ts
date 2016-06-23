import * as React from 'react';
import * as ReactDomServer from 'react-dom/server';
import { match, RouterContext } from 'react-router'
import * as Relay from 'react-relay';
import * as IsomorphicRelay from 'isomorphic-relay';
import IsomorphicContext from 'pz-client/src/app/isomorphic-context.component';

import routes from 'pz-client/src/routes'

// const GRAPHQL_URL = `http://localhost:3000/i/graphql`; //NO COMMIT
//
// const networkLayer = new Relay.DefaultNetworkLayer(GRAPHQL_URL); //NO COMMIT
//
// const rendererProps = {
//     Container: container,
//
//     environment: Relay.Store,
//
//     queryConfig: {
//         name: 'AppRoute',
//
//         params: {},
//
//         queries: {
//             viewer: () => Relay.QL`
//                 query {
//                     viewer
//                 }
//             `
//         }
//     }
// }; //NO COMMIT

// export function renderApp(app: IApp, renderProps: any) {
//     const routerContext = React.createElement(RouterContext, renderProps);
//    
//     var isomorphicContext = React.createElement(IsomorphicContext, {
//         children: routerContext
//     });
//    
//     return ReactDomServer.renderToString(isomorphicContext);
// }

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
                    // content: renderApp(app, renderProps)
                    content: ''
                });
                
            } else {
                next();
            }
        });
    });
}
