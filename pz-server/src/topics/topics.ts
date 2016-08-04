import {
    IRepository,
    IRepositoryRecord,
    createRecordFromLoopback
} from 'pz-server/src/support/repository';

import promisify from 'pz-support/src/promisify';
import {ISluggable} from 'pz-server/src/url-slugs/mixins/sluggable';
import {IUrlSlug, IUrlSlugInstance} from 'pz-server/src/url-slugs/models/url-slug';
import {ICommunityItem} from 'pz-server/src/community-items/community-items';
import {ITopic as ILoopbackTopic} from 'pz-server/src/models/topic'

import {
    IForwardCursor, ICursorResults, fromDateCursor,
    shouldSkipAfter, toDateCursor
} from 'pz-server/src/support/cursors/cursors';


export type TTopicType = (
    'topic'
    | 'brand'
    | 'product'
);

export interface ITopic extends IRepositoryRecord {
    recordType: 'Topic'

    id?: number
    type: TTopicType
    name: string
    description?: string
    thumbnailPath?: string
    overviewContent?: string
    isVerified?: boolean
    communityItems?: Array<ICommunityItem>
}

export interface ITopics extends IRepository {
    findAll(): Promise<Array<ITopic>>
    findById(id: number): Promise<ITopic>
    findByUrlSlugName(urlSlugName: string): Promise<ITopic>
    findAllCommunityItemsRanked(topicId: number): Promise<Array<ICommunityItem>>
}

//Loopback specific implementation of ITopics repository
export default class Topics implements ITopics {
    private _TopicModel: ILoopbackTopic;
    private _UrlSlugsModel: IPersistedModel;

    constructor(Topic: ILoopbackTopic, UrlSlug: IPersistedModel) {
        this._TopicModel = Topic;
        this._UrlSlugsModel = UrlSlug;
    }

    async findAll() {
        const results = await promisify(this._TopicModel.find, this._TopicModel)();
        return results.map(result => createRecordFromLoopback('Topic', result));
    }

    async findById(id: number) {
        const result = await promisify(this._TopicModel.findById, this._TopicModel)(id);
        return createRecordFromLoopback<ITopic>('Topic', result);
    }

    async findByUrlSlugName(fullSlug: string) {
        let urlSlug: IUrlSlugInstance = await promisify(this._UrlSlugsModel.findOne, this._UrlSlugsModel)({
            where: {
                sluggableType: this._TopicModel.sluggableType,
                fullSlugLowercase: fullSlug.toLowerCase()
            }
        }) as IUrlSlugInstance;

        const result = await promisify(this._TopicModel.findById, this._TopicModel)(urlSlug.sluggableId);
        return createRecordFromLoopback<ITopic>('Topic', result);
    }

    async findAllCommunityItemsRanked(topicId: number): Promise<Array<ICommunityItem>> {


        const topic: ILoopbackTopic = await promisify(
            this._TopicModel.findById, this._TopicModel)(topicId);

        const communityItemModels = await promisify(
           topic.communityItems, this._TopicModel)({});

         return communityItemModels.map((communityItem) =>
            createRecordFromLoopback<ICommunityItem>('CommunityItem', communityItem)
        );
    }

    create(topic: ITopic) {
    }

    _modelsToCursorResults(models: Array<IPersistedModelInstance>): ICursorResults<ICommunityItem> {
        const results = models.map(model => {
            const record = createRecordFromLoopback<ICommunityItem>('CommunityItem', model);

            return {
                cursor: toDateCursor((model as any).createdAt),
                item: record
            };
        });

        return {
            results,
            hasNextPage: false //TODO:
        }
    }
}

