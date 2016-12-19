export default {
    // Search index
    index: 'praisee',

    // Search index settings
    settings: {

        analysis: {

            filter: {
                // Autocomplete ngram analyzer config
                // https://www.elastic.co/guide/en/elasticsearch/guide/current/_index_time_search_as_you_type.html
                pz_autocomplete_filter: {
                    type: 'edge_ngram',
                    min_gram: 1,
                    max_gram: 20
                }
            },

            analyzer: {
                // Autocomplete ngram analyzer config
                pz_autocomplete: {
                    type: 'custom',
                    tokenizer: 'standard',
                    filter: [
                        'lowercase',
                        'pz_autocomplete_filter'
                    ]
                },

                pz_lowercase_keyword: {
                    type: 'custom',
                    tokenizer: 'keyword',
                    filter: 'lowercase'
                }
            }
        },

        // https://www.elastic.co/guide/en/elasticsearch/guide/current/relevance-is-broken.html
        number_of_shards: 1,

    },

    // Search index types
    types: {
        communityItem: 'communityItem',
        topic: 'topic'
    },

    // Search type mappings
    typeMappings: {
        communityItem: {
            properties: {
                routePath: {
                    type: 'string',
                    index: 'not_analyzed'
                },

                summary: {
                    type: 'string'
                },

                body: {
                    type: 'string'
                }
            }
        },

        topic: {
            properties: {
                routePath: {
                    type: 'string',
                    index: 'not_analyzed'
                },

                name: {
                    type: 'string',
                    analyzer: 'pz_autocomplete',
                    search_analyzer: 'standard',

                    fields: {
                        lowercaseExactMatch: {
                            type: 'string',
                            analyzer: 'pz_lowercase_keyword'
                        }
                    }
                },

                description: {
                    type: 'string'
                },

                isCategory: {
                    type: 'boolean',
                    index: 'not_analyzed'
                }
            }
        }
    }
}
