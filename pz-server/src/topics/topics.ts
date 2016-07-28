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

    id: number
    type: TTopicType
    name: string
    description: string
    thumbnailPath: string
    overviewContent: string
    isVerified: boolean
}

export interface ITopics extends IRepository {
    findAll(): Promise<Array<ITopic>>
    findById(id: number): Promise<ITopic>
    findByUrlSlugName(urlSlugName: string): Promise<ITopic>
}

//Loopback specific implementation of ITopics repository
export default class Topics implements ITopics {
    private _Topic: IPersistedModel & ISluggable;
    private _UrlSlugs: IPersistedModel;

    constructor(Topic: IPersistedModel & ISluggable, UrlSlug: IPersistedModel) {
        this._Topic = Topic;
        this._UrlSlugs = UrlSlug;
    }

    async findAll() {
        const results = await promisify(this._Topic.find, this._Topic)();
        return results.map(result => createRecordFromLoopback('Topic', result));
    }

    async findById(id: number) {
        const result = await promisify(this._Topic.findById, this._Topic)(id);
        return createRecordFromLoopback<ITopic>('Topic', result);
    }

    async findByUrlSlugName(fullSlug: string){        
        let urlSlug: IUrlSlugInstance = await promisify(this._UrlSlugs.findOne, this._UrlSlugs)({
            where: {
                sluggableType: this._Topic.sluggableType,
                fullSlugLowercase: fullSlug.toLowerCase()
            }
        }) as IUrlSlugInstance;
        
        const result = await promisify(this._Topic.findById, this._Topic)(urlSlug.sluggableId);
        return createRecordFromLoopback<ITopic>('Topic', result);
    }

    create(topic: ITopic) {
    }
}

