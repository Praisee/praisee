import * as React from 'react';
import * as ReactDomServer from 'react-dom/server';
import SearchService from 'pz-server/src/search/site-search/search-service';
import searchSchema from 'pz-server/src/search/schema';

export default function (app: IApp) {
    app.get('/i/search/suggestions', function(request, response) {
        let search = new SearchService(searchSchema, app.services.searchClient);
        
        const searchQuery = request.query.query ?
            request.query.query.toString() : '';
        
        if (searchQuery.length < 1) {
            response.json({results: []});
        }
        
        search.suggest(searchQuery).then(results => response.json({results}));
    });
}
