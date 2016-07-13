export interface IPath {
    index?: string
    type?: string
    id?: string
}

export interface ITypePath {
    index: string
    type: string
}

export interface IDocumentPath extends ITypePath {
    id: string | number
}

/**
 * @source https://www.elastic.co/guide/en/elasticsearch/reference/2.3/docs-index_.html
 */
export interface IDocumentUpdateResult {
    _index: string
    _type: string
    _id: string
    _version: number
    created: boolean
}

export interface ISearchSchema {
    index: string
    settings?: {}
    types: { [type: string]: string }
    typeMappings?: {}
}

/**
 * @source 
 */
export interface ISearchQuery {
    query?: {},
    filter?: {}
}

/**
 * @source
 */
export interface ISearchResults {
    hits: {
        total: number,
        hits: Array<ISearchResultHit>
    }
}

export interface ISearchResultHit {
    _index: string
    _type: string
    _id: string
    _source: any
}

export interface IBulkOperation {
    type: 'create' | 'update' | 'upsert' | 'delete'
    path: ITypePath | IDocumentPath
    document?: any
}

export interface IBulkUpsert extends IBulkOperation {
    type: 'upsert'
    path: IDocumentPath
    document: any
}

export interface IBulkDelete extends IBulkOperation {
    type: 'delete'
    path: IDocumentPath
}

export type TBulkOperations = Array<IBulkOperation>
