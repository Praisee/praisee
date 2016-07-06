import {ISearchSuggestionResult} from 'pz-server/src/search/search-results';
import * as queryString from 'querystring';

export default class SearchClient {
    getSuggestions(query: string): Promise<Array<ISearchSuggestionResult>> {
        const request = fetch('/i/search/suggestions?' + queryString.stringify({query}), {
            credentials: 'same-origin'
        });
        
        return (request
            .then(response => {
                if (response.status !== 200) {
                    console.error('Received error from server: ', response);
                    throw new Error('Received error from server: ' + response.status);
                }
                
                return response.json();
            })
            
            .then(response => {
                if (!Array.isArray(response.results)) {
                    throw new Error('Unable to find search results in body');
                }
                
                return response.results as Array<ISearchSuggestionResult>;
            })
        );
    }
}
