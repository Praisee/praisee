import * as React from 'react';
import SuggestionsService from 'pz-server/src/search/suggestions-service';
import searchSchema from 'pz-server/src/search/schema';

module.exports = function (app: IApp) {
    app.get('/i/search/mention-suggestions', function(request, response) {
        let suggester = new SuggestionsService(searchSchema, app.services.searchClient);

        const searchQuery = request.query.query ?
            request.query.query.toString() : '';

        if (searchQuery.length < 1) {
            response.json({results: []});
            return;
        }

        suggester.suggest(searchQuery).then(results => response.json({results}));
    });
};
