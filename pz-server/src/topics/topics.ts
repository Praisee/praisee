import {
    IRepository,
    IRepositoryRecord,
    createRecordFromLoopback
} from 'pz-server/src/support/repository';

import promisify from 'pz-support/src/promisify';
import {ISluggable} from 'pz-server/src/url-slugs/mixins/sluggable';
import {IUrlSlug, IUrlSlugInstance} from 'pz-server/src/url-slugs/models/url-slug';


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
}

export interface ITopics extends IRepository {
    findAll(): Promise<Array<ITopic>>
    findById(id: number): Promise<ITopic>
    findByUrlSlugName(urlSlugName: string): Promise<ITopic>
}

//Loopback specific implementation of ITopics repository
export default class Topics implements ITopics {
    private _TopicModel: IPersistedModel & ISluggable;
    private _UrlSlugsModel: IPersistedModel;

    constructor(Topic: IPersistedModel & ISluggable, UrlSlug: IPersistedModel) {
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

    async findByUrlSlugName(fullSlug: string){
        let urlSlug: IUrlSlugInstance = await promisify(this._UrlSlugsModel.findOne, this._UrlSlugsModel)({
            where: {
                sluggableType: this._TopicModel.sluggableType,
                fullSlugLowercase: fullSlug.toLowerCase()
            }
        }) as IUrlSlugInstance;

        const result = await promisify(this._TopicModel.findById, this._TopicModel)(urlSlug.sluggableId);
        return createRecordFromLoopback<ITopic>('Topic', result);
    }

    create(topic: ITopic) {
    }
}

