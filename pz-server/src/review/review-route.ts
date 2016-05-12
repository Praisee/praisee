import * as React from 'react';
import * as ReactDom from 'react-dom/server';
import Review from 'pz-client/src/review.component';

export default function(app: IApp){
    app.get('/', function(request, response){
        response.render('review/review-view',
        {})
    })
}