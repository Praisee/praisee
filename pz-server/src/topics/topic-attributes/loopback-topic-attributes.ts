import promisify from 'pz-support/src/promisify';

import {
    ITopicAttributes,
    ITopicAttribute
} from 'pz-server/src/topics/topic-attributes/topic-attributes';

import {
    ITopicAttributeInstance,
    ITopicAttributeModel
} from 'pz-server/src/models/topic-attribute';

import {createRecordFromLoopback} from 'pz-server/src/support/repository';

export function createRecordFromLoopbackTopicAttribute(topicAttribute: ITopicAttributeInstance): ITopicAttribute {
    return createRecordFromLoopback<ITopicAttribute>('TopicAttribute', topicAttribute);
}

export default class LoopbackTopicAttributes implements ITopicAttributes {
    private _TopicAttributeModel: ITopicAttributeModel;

    constructor(TopicAttributeModel: ITopicAttributeModel) {
        this._TopicAttributeModel = TopicAttributeModel;
    }

    async findById(id: number): Promise<ITopicAttribute> {
        const model = await promisify(this._TopicAttributeModel.findById, this._TopicAttributeModel)(id);
        return createRecordFromLoopbackTopicAttribute(model);
    }

    async findAllByTopicId(topicId: number): Promise<Array<ITopicAttribute>> {
        const models = await promisify(this._TopicAttributeModel.find, this._TopicAttributeModel)({
            where: { topicId }
        });

        return models.map(createRecordFromLoopbackTopicAttribute);
    }

    async create(topicAttribute: ITopicAttribute): Promise<ITopicAttribute> {
        const model = new this._TopicAttributeModel(topicAttribute);
        const resultModel = await promisify(model.save, model)();
        return createRecordFromLoopbackTopicAttribute(resultModel);
    }
}
