import {ISearchQuery} from 'pz-server/src/search/search';

export function getSuggestionsForUserQuery(query: string): ISearchQuery {
    return {
        "query": {
            "bool": {
                "should": [
                    {
                        "bool": {
                            "filter": {
                                "type": {
                                    "value": "topic"
                                }
                            },
                            "must": {
                                "match": {
                                    "name": {
                                        "query": query,
                                        "boost": 2
                                    }
                                }
                            }
                        }
                    },

                    {
                        "bool": {
                            "filter": {
                                "type": {
                                    "value": "communityItem"
                                }
                            },
                            "must": {
                                "multi_match": {
                                    "query": query,
                                    "fields": ["summary", "body"]
                                }
                            }
                        }
                    }
                ]
            }
        }
    }
}

export function getReviewableSuggestionsForUserQuery(query: string): ISearchQuery {
    return {
        "query": {
        "bool": {
            "should": [
                // Partial match non-categories
                {
                    "bool": {
                        "filter": [
                            {
                                "type": {
                                    "value": "topic"
                                }
                            },
                            {
                                "term": {
                                    "isCategory": false
                                }
                            }
                        ],
                        "must": {
                            "match": {
                                "name": query
                            }
                        }
                    }
                },

                // Or match exactly on a category so we know to disallow adding it
                {
                    "bool": {
                        "filter": [
                            {
                                "type": {
                                    "value": "topic"
                                }
                            },
                            {
                                "term": {
                                    "isCategory": true
                                }
                            }
                        ],
                        "must": {
                            "match": {
                                "name.lowercaseExactMatch": query
                            }
                        }
                    }
                }
            ]
        }
        }
    };
}
