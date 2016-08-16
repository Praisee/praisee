import {
    IRepository,
    IRepositoryRecord,
    createRecordFromLoopback
} from 'pz-server/src/support/repository';

import {ISluggable, ISluggableInstance} from 'pz-server/src/url-slugs/mixins/sluggable';
import {ICommunityItemInstance} from 'pz-server/src/models/community-item';

export type TTopicType = (
    'topic'
    | 'brand'
    | 'product'
);

export interface ITopicModel extends IPersistedModel, ISluggable {
    type: TTopicType
}

export interface ITopicInstance extends IPersistedModelInstance, ISluggableInstance {
    id: number
    name: string
    description: string
    thumbnailPath: string
    overviewContent: string
    isVerified: boolean
    communityItems: IRelatedPersistedModel<ICommunityItemInstance>
}

module.exports = function (Topic: ITopicModel) {
};
