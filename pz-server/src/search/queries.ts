import {ISearchQuery} from 'pz-server/src/search/search';

export function findCommunityItemByKeys(communityItemType: string, communityItemId: number): ISearchQuery {
    return {
        filter: {
            bool: {
                must: [
                    {term: { type: communityItemType }},
                    {term: { communityItemId: communityItemId }}
                ]
            }
        }
    }
}

export function findTopicByKey(topicId: number): ISearchQuery {
    return {
        filter: {
            term: { topicId: topicId }
        }
    }
}

export function getSuggestionsForUserQuery(query: string): ISearchQuery {
    return {
        query: {
            bool: {
                should: [
                    {
                        bool: {
                            filter: {
                                type: {
                                    value: 'topic'
                                }
                            },
                            must: {
                                match: {
                                    name: {
                                        query: query,
                                        boost: 2
                                    }
                                }
                            }
                        }
                    },

                    {
                        bool: {
                            filter: {
                                type: {
                                    value: 'communityItem'
                                }
                            },
                            must: {
                                multi_match: {
                                    query: query,
                                    fields: ['summary', 'body']
                                }
                            }
                        }
                    }
                ]
            }
        }
    }
}
