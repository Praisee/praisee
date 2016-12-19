export interface ISuggestionResult {
    id: number
    type: 'topic' | 'communityItem' | 'user'
    title: string
    routePath: string
    thumbnailPath: string
    [customProperties: string]: any
}

export interface ITopicSearchSuggestionResult extends ISuggestionResult {
    type: 'topic'
    isCategory: boolean
}
