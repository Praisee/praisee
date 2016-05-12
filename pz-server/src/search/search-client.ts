import elasticSearchConfig from 'pz-server/src/search/elasticsearch-config';
import {
    IDocumentUpdateResult,
    IDocumentPath,
    ITypePath,
    ISearchQuery,
    ISearchResults,
    IPath
} from 'pz-server/src/search/search';

var elasticsearch = require('elasticsearch');

export default class SearchClient {
    public elasticClient;
    
    constructor() {
        this.elasticClient = new elasticsearch.Client(elasticSearchConfig);
    }
    
    resetIndex(index: string): Promise<any> {
        return (Promise.resolve()
            .then(() => this.elasticClient.indices.delete({index}))
            .then(() => this.elasticClient.indices.create({index}))
            .catch(error => {
                console.error('Error while resetting index', error);
                throw error;
            })
        );
    }
    
    search(query: ISearchQuery, path?: IPath): Promise<ISearchResults> {
        if (path) {
            return this.elasticClient.search(Object.assign({}, path, {body: query}));
        } else {
            return this.elasticClient.search(query);
        }
    }
    
    createDocument(path: ITypePath, document: any): Promise<IDocumentUpdateResult> {
        return this.elasticClient.create({
            index: path.index,
            type: path.type,
            body: document
        });
    }
    
    updateDocument(path: IDocumentPath, document: any): Promise<IDocumentUpdateResult> {
        return this.elasticClient.update({
            index: path.index,
            type: path.type,
            id: path.id,
            body: {
                doc: document
            }
        });
    }
    
    createOrUpdate(path: ITypePath, query: ISearchQuery, document: any) {
        return (Promise.resolve()
            .then(() => this.search(query, path))
                
            .then((results) => {
                const resultCount = results.hits.total;
                
                if (resultCount === 1) {
                    
                    const matchedDocument = results.hits.hits[0];
                    const existingPath = {
                        index: matchedDocument._index,
                        type: matchedDocument._type,
                        id: matchedDocument._id
                    };
                    
                    return this.updateDocument(existingPath, document);
                    
                } else if (resultCount < 1) {

                    return this.createDocument(path, document);
                    
                } else {
                    
                    throw new Error('Ambiguous createOrUpdate query matches more than one result');
                    
                }
            })
        );
    }
    
    destroyDocument(path: IDocumentPath) {
        return this.elasticClient.delete({
            index: path.index,
            type: path.type,
            id: path.id,
        });
    }
}
