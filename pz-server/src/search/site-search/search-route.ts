import * as React from 'react';
import * as ReactDomServer from 'react-dom/server';
import SearchService from 'pz-server/src/search/site-search/search-service';
import searchSchema from 'pz-server/src/search/schema';
import SearchComponent from 'pz-client/src/search-proofofconcept/search.component';

export default function (app: IApp) {
    app.get('/i/search/suggestions', function(request, response) {
        let search = new SearchService(searchSchema, app.domain.searchClient);
        
        const searchQuery = request.query.query ?
            request.query.query.toString() : '';
        
        if (searchQuery.length < 1) {
            response.json({results: []});
        }
        
        search.suggest(searchQuery).then(results => response.json({results}));
    });
    
    app.get('/i/search/poc', function(request, response) {
        response.render('search/proofofconcept/search-view',
            {content: ReactDomServer.renderToString(React.createElement(SearchComponent))});
    });
}
