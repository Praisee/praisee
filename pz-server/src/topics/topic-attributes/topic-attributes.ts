/**
 * Topic Attributes define meta information about topics that are displayed in the
 * topic side bar, used in aiding the search engine and relating topics to each
 * other by similarity.
 */

import { IRepository, IRepositoryRecord } from 'pz-server/src/support/repository';

export interface ITopicAttribute extends IRepositoryRecord {
    recordType: 'TopicAttribute'

    id?: number
    topicId?: number

    attributeType?: string
    value?: any

    createdAt?: Date
    updatedAt?: Date
}

export interface ITopicAttributes extends IRepository {
    findById(id: number): Promise<ITopicAttribute>
    findAllByTopicId(topicId: number): Promise<Array<ITopicAttribute>>
    create(topicAttribute: ITopicAttribute): Promise<ITopicAttribute>
}

export function isTopicAttribute(object: any): object is ITopicAttribute {
    return object && object.recordType === 'TopicAttribute' && object.attributeType;
}
