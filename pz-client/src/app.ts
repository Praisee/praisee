import * as React from 'react';
import * as ReactRouter from 'react-router';
import * as ReactDom from 'react-dom';
import routes from 'pz-client/src/routes';
import 'isomorphic-fetch';

ReactDom.render(
    React.createElement(ReactRouter.Router, {
        routes: routes, history: ReactRouter.browserHistory
    }),
    document.querySelector('.app-container')
);
