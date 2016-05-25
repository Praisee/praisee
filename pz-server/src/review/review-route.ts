import * as React from 'react';
import * as ReactDom from 'react-dom/server';
import ReviewList from 'pz-client/src/review/reviewList.component';

export default function(app: IApp){
    app.get('/', function(request, response){
        response.render('review/review-view',
        {})
    })
}