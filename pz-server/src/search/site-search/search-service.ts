
import {
    ISearchSchema,
    ISearchResults as IRawSearchResults,
    IPath,
    ISearchQuery,
    ISearchResultHit
} from 'pz-server/src/search/search';

import {ISearchSuggestionResult} from 'pz-server/src/search/search-results';

import {getSuggestionsForUserQuery} from 'pz-server/src/search/queries';

interface ISearchClient {
    search(query: ISearchQuery, path?: IPath): Promise<IRawSearchResults>
}

export default class Searcher {
    private _searchSchema: ISearchSchema;
    private _searchClient: ISearchClient;
    
    constructor(searchSchema, searchClient) {
        this._searchSchema = searchSchema;
        this._searchClient = searchClient;
    }
    
    async suggest(queryString: string): Promise<Array<ISearchSuggestionResult>> {
        // TODO: Accept a context parameter to refine search further
        
        const query = getSuggestionsForUserQuery(queryString);
        
        const results = await this._searchClient.search(
            query, {index: this._searchSchema.index}
        );

        const hits = results.hits.hits;
        
        return hits.map(hit => this._convertSearchHitIntoSearchSuggestions(hit));
    }
    
    _convertSearchHitIntoSearchSuggestions(searchHit: ISearchResultHit): ISearchSuggestionResult {
        
        switch(searchHit._type) {
            case 'topic':
                return {
                    type: 'topic',
                    title: searchHit._source.name,
                    routePath: searchHit._source.routePath,
                    thumbnailPath: ''
                };
            
            case 'communityItem':
                return {
                    type: 'communityItem',
                    title: searchHit._source.summary,
                    routePath: searchHit._source.routePath,
                    thumbnailPath: ''
                };
            
            default:
                throw new Error('Unable to handle search document type: ' + searchHit._type);
        }
    }
}
