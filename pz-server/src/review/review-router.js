import express from 'express';

import {
    NotFoundError,
    BadRequestError,
    runOrSendError
} from 'pz-server/src/support/router-error-handlers';

import formatMiddleware from 'pz-server/src/support/format-middleware';

import React from 'react';
import ReactDomServer from 'react-dom/server';
import Test from 'pz-client/src/test-component';

export default class ReviewRouter {
    constructor(dataSource) {
        this.dataSource = dataSource;
        this.router = express.Router();
    }
    
    createRoutes() {
        this.router.get('/', formatMiddleware(this._index.bind(this)));
        
        return this.router;
    }
    
    static createRoutes(dataSource) {
        let reviewRouter = new ReviewRouter(dataSource);
        return reviewRouter.createRoutes();
    }
    
    _index(request, response) {
        return {
            html: () => {
                response.send(ReactDomServer.renderToString(
                    <Test />
                ))
            }
        }
    }
}

export default function(dataSource) {
    const router = express.Router();

    router.get('/', runOrSendError(async function (request, response) {
        response.json();
    }));
};
