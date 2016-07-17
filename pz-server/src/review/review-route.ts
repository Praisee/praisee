import * as React from 'react';
import * as ReactDom from 'react-dom/server';

export default function(app: IApp){
    app.get('/review', function(request, response){
        response.render('review/review-view',
        {})
    })
}