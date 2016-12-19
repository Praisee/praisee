
import {
    ISearchSchema,
    ISearchResults as IRawSearchResults,
    IPath,
    ISearchQuery,
    ISearchResultHit
} from 'pz-server/src/search/search';

import {ISuggestionResult} from 'pz-server/src/search/suggestion-results';

interface ISearchClient {
    search(query: ISearchQuery, path?: IPath): Promise<IRawSearchResults>
}

export default class SuggestionsService {
    private _searchSchema: ISearchSchema;
    private _searchClient: ISearchClient;

    constructor(searchSchema, searchClient) {
        this._searchSchema = searchSchema;
        this._searchClient = searchClient;
    }

    async suggest(query: ISearchQuery): Promise<Array<ISuggestionResult>> {
        // TODO: Accept a context parameter to refine search further

        const results = await this._searchClient.search(
            query, {index: this._searchSchema.index}
        );

        const hits = results.hits.hits;

        return hits.map(hit => this._convertSearchHitIntoSearchSuggestions(hit));
    }

    _convertSearchHitIntoSearchSuggestions(searchHit: ISearchResultHit): ISuggestionResult {
        switch(searchHit._type) {
            case 'topic':
                return {
                    id: Number(searchHit._id),
                    type: 'topic',
                    title: searchHit._source.name,
                    routePath: searchHit._source.routePath,
                    thumbnailPath: '',
                    isCategory: searchHit._source.isCategory
                };

            case 'communityItem':
                return {
                    id: Number(searchHit._id),
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
