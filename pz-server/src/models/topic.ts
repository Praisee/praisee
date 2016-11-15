import { ISluggable, ISluggableInstance } from 'pz-server/src/url-slugs/mixins/sluggable';
import { ICommunityItemInstance } from 'pz-server/src/models/community-item';
import { IPhotoInstance } from 'pz-server/src/models/photo';
import promisify from 'pz-support/src/promisify';

export type TTopicType = (
    'topic'
    | 'brand'
    | 'product'
);

export interface ITopicModel extends IPersistedModel, ISluggable {
    type: TTopicType
    getCommunityItemCount(topicId: number): Promise<number>
}

export interface ITopicInstance extends IPersistedModelInstance, ISluggableInstance {
    id: number
    name: string

    // TODO: name and disambiguator were going to be a unique key, but it wasn't working
    // TODO: Loopback doesn't allow nullable columns so the unique constraint failed
    // disambiguator: string | null

    description: string | null
    overviewContent: string | null
    isVerified: boolean
    isCategory: boolean
    thumbnailPhotoPath: string | null
    communityItems: IRelatedPersistedModel<ICommunityItemInstance>
    photos: IRelatedPersistedModel<IPhotoInstance>
    reviews: IRelatedPersistedModel<ICommunityItemInstance>
}

module.exports = function (Topic: ITopicModel) {

    Topic.getCommunityItemCount = async (topicId: number) => {
        const TopicCommItemRelations = Topic.app.models.TopicCommunityItem;
        const count: number = await promisify<number>(
            TopicCommItemRelations.count, TopicCommItemRelations)({ topicId });

        return count;
    }
};
