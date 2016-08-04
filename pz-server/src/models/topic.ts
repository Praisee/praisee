import {ISluggable, ISluggableInstance} from 'pz-server/src/url-slugs/mixins/sluggable';

export type TTopicType = (
    'topic'
    | 'brand'
    | 'product'
);

export interface ITopic extends IPersistedModel, ISluggable {
    type: TTopicType
}

export interface ITopicInstance extends IPersistedModelInstance, ISluggableInstance {
    id: number
    name: string
    description: string
    thumbnailPath: string
    overviewContent: string
    isVerified: boolean
    communityItems: IRelatedPersistedModel    
}

module.exports = function (Topic: ITopic) {
};
