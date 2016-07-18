import {ISluggable, ISluggableInstance} from 'pz-server/src/url-slugs/mixins/sluggable';

export type TCommunityItemType = (
    'comment'
    | 'comparison'
    | 'howto'
    | 'question'
    | 'answer'
    | 'review'
);

export interface ICommunityItem extends IPersistedModel, ISluggable {
    type: TCommunityItemType
}

export interface ICommunityItemInstance extends IPersistedModelInstance, ISluggableInstance {
    id: number
    summary: string,
    body: string,
    createdAt: string,
    updatedAt: string
}

module.exports = function (CommunityItem: ICommunityItem) {
};
