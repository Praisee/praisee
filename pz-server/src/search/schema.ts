export default {
    // Search index
    index: 'praisee',

    // Search index settings
    settings: {

        // Autocomplete ngram analyzer config
        // https://www.elastic.co/guide/en/elasticsearch/guide/current/_index_time_search_as_you_type.html
        analysis: {
            filter: {
                autocomplete_filter: {
                    type: 'edge_ngram',
                    min_gram: 1,
                    max_gram: 20
                }
            },

            analyzer: {
                autocomplete: {
                    type: 'custom',
                    tokenizer: 'standard',
                    filter: [
                        'lowercase',
                        'autocomplete_filter'
                    ]
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
                type: {
                    type: 'string',
                    index: 'not_analyzed'
                },
                
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
                type: {
                    type: 'string',
                    index: 'not_analyzed'
                },

                routePath: {
                    type: 'string',
                    index: 'not_analyzed'
                },
                
                name: {
                    type: 'string',
                    analyzer: 'autocomplete',
                    search_analyzer: 'standard'
                },

                description: {
                    type: 'string'
                }
            }
        }
    }
}
