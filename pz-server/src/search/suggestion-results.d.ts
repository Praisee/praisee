export interface ISuggestionResult {
    id: number
    type: 'topic' | 'communityItem' | 'user'
    title: string
    routePath: string
    thumbnailPath: string
}

export interface ITopicSearchSuggestionResult extends ISuggestionResult {
    type: 'topic'
}
