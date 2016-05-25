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
