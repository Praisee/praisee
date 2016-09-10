export interface ITopicAttributeModel extends IPersistedModel {

}

export interface ITopicAttributeInstance extends IPersistedModelInstance {
    id: number
    topicId: number
    attributeType: string
    value: any
    createdAt: Date
    updatedAt: Date
}
