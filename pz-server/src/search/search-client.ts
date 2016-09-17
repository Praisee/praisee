import elasticSearchConfig from 'pz-server/src/search/elasticsearch-config';
import {
    IDocumentUpdateResult,
    IDocumentPath,
    ITypePath,
    ISearchQuery,
    ISearchResults,
    IPath,
    ISearchSchema,
    TBulkOperations,
    IBulkDelete,
    IBulkUpsert,
    ISearchResultHit
} from 'pz-server/src/search/search';

var elasticsearch = require('elasticsearch');

export default class SearchClient {
    public elasticClient;

    constructor() {
        this.elasticClient = new elasticsearch.Client(Object.assign({}, elasticSearchConfig.client));
    }

    search(query: ISearchQuery, path?: IPath): Promise<ISearchResults> {
        if (path) {
            return this.elasticClient.search(Object.assign({}, path, {body: query}));
        } else {
            return this.elasticClient.search(query);
        }
    }

    getDocument(path: IDocumentPath): Promise<ISearchResultHit> {
        return (this.elasticClient
            .get(path)
            .catch((error) => {
                if (error && error.status && error.status === 404) {
                    return null;
                } else {
                    throw error;
                }
            })
        );
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

    upsertDocument(path: IDocumentPath, document: any): Promise<IDocumentUpdateResult> {
        return this.elasticClient.update({
            index: path.index,
            type: path.type,
            id: path.id,
            body: {
                doc: document,
                doc_as_upsert: true
            }
        });
    }

    upsertDocumentByQuery(path: ITypePath, query: ISearchQuery, document: any) {
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

    destroyDocumentByQuery(path: ITypePath, query: ISearchQuery) {
        return (Promise.resolve()
            .then(() => this.search(query, path))

            .then((results) => {
                const resultCount = results.hits.total;

                if (resultCount < 1) {
                    return;
                }

                if (resultCount === 1) {
                    const matchedDocument = results.hits.hits[0];

                    const fullPath = {
                        index: matchedDocument._index,
                        type: matchedDocument._type,
                        id: matchedDocument._id
                    };

                    return this.destroyDocument(fullPath);

                } else {

                    throw new Error('Ambiguous createOrUpdate query matches more than one result');

                }
            })
        );
    }

    resetIndex(index: string, body: {} = {}): Promise<any> {
        return (Promise.resolve()
            .then(() => this.elasticClient.indices.delete({index}))
            .catch(() => { /* That's ok, let's keep going */ })

            .then(() => this.elasticClient.indices.create({index, body}))
            .catch(error => {
                console.error('Error while resetting index', error);
                throw error;
            })
        );
    }

    resetIndexFromSchema(schema: ISearchSchema) {
        return this.resetIndex(schema.index, {
            settings: schema.settings || {},
            mappings: schema.typeMappings || {}
        });
    }

    performBulkOperations(bulkOperations: Array<IBulkUpsert | IBulkDelete>): Promise<void> {
        if (!bulkOperations.length) {
            return Promise.resolve();
        }

        const bulkBody = bulkOperations.reduce((bulkBody, bulkOperation) => {
            if (bulkOperation.type === 'upsert') {
                return bulkBody.concat(this._bulkUpsertToBody(bulkOperation as IBulkUpsert));

            } else if (bulkOperation.type === 'delete') {
                return bulkBody.concat(this._bulkDeleteToBody(bulkOperation as IBulkDelete));

            } else {
                console.error('Unable to handle bulk operation: ' + (bulkOperation as any).type);
                return bulkBody;
            }

        }, []);

        return this.elasticClient.bulk({
            body: bulkBody
        });
    }

    private _bulkUpsertToBody(bulkUpsert: IBulkUpsert) {
        return [
            {
                update: {
                    _index: bulkUpsert.path.index,
                    _type: bulkUpsert.path.type,
                    _id: bulkUpsert.path.id
                }
            },
            {
                doc: bulkUpsert.document,
                doc_as_upsert: true
            }
        ];
    }

    private _bulkDeleteToBody(bulkDelete: IBulkDelete) {
        return {
            'delete': {
                _index: bulkDelete.path.index,
                _type: bulkDelete.path.type,
                _id: bulkDelete.path.id
            }
        };
    }
}
