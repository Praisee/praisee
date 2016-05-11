export interface ICommunityItemSearch extends IPersistedModel {
}

export interface ICommunityItemSearchInstance extends IPersistedModelInstance {
    communityItemId: number
    type: string,
    summary: string,
    body: string
}

module.exports = function (CommunityItemSearch: IModel) {
    CommunityItemSearch.validatesInclusionOf('type', {
        'in': [
            'comment',
            'comparison',
            'howto',
            'question',
            'review'
        ]
    });
};
