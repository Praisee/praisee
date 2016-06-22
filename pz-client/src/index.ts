import * as React from 'react';
import * as ReactRouter from 'react-router';
import * as ReactDom from 'react-dom';
import routes from 'pz-client/src/routes';
import 'isomorphic-fetch';
import IsomorphicContext from 'pz-client/src/app/isomorphic-context.component';

var router = React.createElement(ReactRouter.Router, {
    routes: routes,
    history: ReactRouter.browserHistory
});

var isomorphicContext = React.createElement(IsomorphicContext, {
    children: router
});

ReactDom.render(isomorphicContext, document.querySelector('.app-container'));
