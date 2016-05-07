import * as React from 'react';
import * as ReactDomServer from 'react-dom/server';
import Home from 'pz-server/src/home/home.component';

export default function (app) {
    app.get('/', function(request, response) {
        response.send(ReactDomServer.renderToString(React.createElement(Home)));
    });
}
