import * as React from 'react';
import {Router, Route, IndexRoute} from 'react-router';
import AppController from 'pz-client/src/app.controller';
import HomeController from 'pz-client/src/home.controller';

export default (
    <Router>
        <Route path="/" component={AppController}>
            <IndexRoute component={HomeController} />
            <Route path="about" component={HomeController} />
        </Route>
    </Router>
)


