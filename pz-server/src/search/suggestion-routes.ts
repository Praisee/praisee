import * as React from 'react';
import SuggestionsService from 'pz-server/src/search/suggestions-service';
import searchSchema from 'pz-server/src/search/schema';
import {
    getSuggestionsForUserQuery,
    getNonCategorySuggestionsForUserQuery
} from 'pz-server/src/search/queries';
import appInfo from 'pz-server/src/app/app-info';

module.exports = function (app: IApp) {
    let suggester = new SuggestionsService(searchSchema, app.services.searchClient);

    const routeQueryHandler = (handler: (request, response, query) => any) => (request, response) => {
        const query = request.query.query ?
            request.query.query.toString() : '';

        if (query.length < 1) {
            response.json({results: []});
            return;
        }

        return handler(request, response, query);
    };

    app.get(appInfo.addresses.getSearchSuggestionsApi(), routeQueryHandler((request, response, query) => {
        const searchQuery = getSuggestionsForUserQuery(query);
        suggester.suggest(searchQuery).then(results => response.json({results}));
    }));

    app.get(appInfo.addresses.getMentionSuggestionsApi(), routeQueryHandler((request, response, query) => {
        const searchQuery = getSuggestionsForUserQuery(query);
        suggester.suggest(searchQuery).then(results => response.json({results}));
    }));

    app.get(appInfo.addresses.getReviewableTopicSuggestionsApi(), routeQueryHandler((request, response, query) => {
        const searchQuery = getNonCategorySuggestionsForUserQuery(query);
        suggester.suggest(searchQuery).then(results => response.json({results}));
    }));
};
