import {ITopicAttribute} from 'pz-server/src/topics/topic-attributes/topic-attributes';

export interface ITopicTypeAttribute extends ITopicAttribute {
    attributeType: 'TopicType',
    value: 'Community' | 'Brand' | 'Product'
}

export function createTopicTypeAttribute(topicId, topicType: 'Community' | 'Brand' | 'Product'): ITopicTypeAttribute {
    return {
        recordType: 'TopicAttribute',
        attributeType: 'TopicType',
        topicId,
        value: topicType
    };
}

export interface IParentBrandAttribute extends ITopicAttribute {
    attributeType: 'ParentBrand',
    value: number
}

export function createParentBrandAttribute(topicId, parentTopicId: number): IParentBrandAttribute {
    return {
        recordType: 'TopicAttribute',
        attributeType: 'ParentBrand',
        topicId,
        value: parentTopicId
    };
}

export interface IRelatedTopicsAttribute extends ITopicAttribute {
    attributeType: 'RelatedTopics',
    value: Array<number>
}

export function createRelatedTopicsAttribute(topicId, relatedTopicIds: Array<number>): IRelatedTopicsAttribute {
    return {
        recordType: 'TopicAttribute',
        attributeType: 'RelatedTopics',
        topicId,
        value: relatedTopicIds
    };
}

export interface IProductSpecsAttribute extends ITopicAttribute {
    attributeType: 'ProductSpecs',

    value: {
        [specificationName: string]: any
    }
}

export function createProductSpecsAttribute(topicId, productSpecs: {}): IProductSpecsAttribute {
    return {
        recordType: 'TopicAttribute',
        attributeType: 'ProductSpecs',
        topicId,
        value: productSpecs
    };
}
