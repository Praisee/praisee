import * as React from 'react';
import * as ReactDomServer from 'react-dom/server';
import Home from 'pz-client/src/home.component';

export default function (app: IApp) {
    app.get('/', function(request, response) {
        response.render('home/home-view',
            {content: ReactDomServer.renderToString(React.createElement(Home))});
    });
}
