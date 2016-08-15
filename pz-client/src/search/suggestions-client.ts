import * as queryString from 'querystring';

import {ISearchSuggestionResult} from 'pz-server/src/search/search-results';
export {ISearchSuggestionResult} from 'pz-server/src/search/search-results';

export default class SuggestionsClient {
    private _apiPath;

    constructor(apiPath = '/i/search/suggestions') {
        this._apiPath = apiPath;
    }

    async getSuggestions(query: string): Promise<Array<ISearchSuggestionResult>> {
        const response = await fetch(this._apiPath + '?' + queryString.stringify({query}), {
            credentials: 'same-origin'
        });

        if (response.status !== 200) {
            console.error('Received error from server: ', response);
            throw new Error('Received error from server: ' + response.status);
        }

        const responseBody = await response.json();

        if (!Array.isArray(responseBody.results)) {
            throw new Error('Unable to find search results in body');
        }

        return responseBody.results as Array<ISearchSuggestionResult>;
    }
}
