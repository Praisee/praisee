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
    id: string
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
    query?: TQueryBody,
    filter?: TQueryBody
}

/**
 * @source
 */
export interface ISearchResults {
    hits: {
        total: number,
        hits: Array<{
            _index: string
            _type: string
            _id: string
            _source: any
        }>
    }
}

type TQueryBody = IBoolQuery | IMatchQuery | TTermLevelQuery;

type TPrimitive = string | number | boolean
type TPrimitiveOrType<T> = TPrimitive | T

/**
 * @source https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-bool-query.html
 */
interface IBoolQuery {
    bool: {
        must?: TQueryBody | Array<TQueryBody>
        must_not?: TQueryBody | Array<TQueryBody>
        should?: TQueryBody | Array<TQueryBody>
        filter?: TQueryBody | Array<TQueryBody>
        minimum_should_match?: number
        boost?: number
    }
}

/**
 * @source: https://www.elastic.co/guide/en/elasticsearch/reference/2.3/query-dsl-match-query.html
 */
interface IMatchQuery {
    match: {
        [property: string]: TPrimitiveOrType<{
            query: string | number | boolean
            operator: 'and' | 'or'
            zero_terms_query?: 'none' | 'all'
            cutoff_frequency?: number
            type?: 'phrase'
        }>
    }
}

/**
 * @source https://www.elastic.co/guide/en/elasticsearch/reference/current/term-level-queries.html
 */
type TTermLevelQuery = ITermQuery | ITypeQuery | IIdsQuery;

/**
 * @source https://www.elastic.co/guide/en/elasticsearch/reference/2.3/query-dsl-term-query.html
 */
interface ITermQuery {
    term: {
        [property: string]: TPrimitiveOrType<{
            value: string | number | boolean
            boost?: number
        }>
    }
}

/**
 * @source https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-type-query.html
 */
interface ITypeQuery {
    type: {
        value: string
    }
}

/**
 * @source https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-ids-query.html
 */
interface IIdsQuery {
    ids: {
        type: string,
        values: Array<string>
    }
}
