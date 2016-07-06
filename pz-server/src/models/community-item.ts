export type TCommunityItemType = (
    'comment'
    | 'comparison'
    | 'howto'
    | 'question'
    | 'answer'
    | 'review'
);

export interface ICommunityItem extends IPersistedModel {
    type: TCommunityItemType
}

export interface ICommunityItemInstance extends IPersistedModelInstance {
    id: number
    summary: string,
    body: string
}

module.exports = function (CommunityItem: ICommunityItem) {
};
