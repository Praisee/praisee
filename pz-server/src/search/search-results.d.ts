export interface ISearchSuggestionResult {
    type: 'topic' | 'communityItem' | 'user'
    title: string
    routePath: string
    thumbnailPath: string
}
