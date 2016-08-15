export interface ISearchSuggestionResult {
    id: number
    type: 'topic' | 'communityItem' | 'user'
    title: string
    routePath: string
    thumbnailPath: string
}
