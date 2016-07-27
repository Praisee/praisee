import {
    IRepository,
    IRepositoryRecord,
    createRecordFromLoopback
} from 'pz-server/src/support/repository';

import promisify from 'pz-support/src/promisify';

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
}

export default class Topics implements ITopics {
    private _Topic: IPersistedModel;

    constructor(Topic: IPersistedModel) {
        this._Topic = Topic;
    }

    async findAll() {
        const results = await promisify(this._Topic.find, this._Topic)();
        return results.map(result => createRecordFromLoopback('Topic', result));
    }

    async findById(id: number) {
        const result = await promisify(this._Topic.findById, this._Topic)(id);
        return createRecordFromLoopback<ITopic>('user', result);
    }

    create(topic: ITopic) {
    }
}

