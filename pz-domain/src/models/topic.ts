export type TTopicType = (
    'topic'
        | 'brand'
        | 'product'
    );

export interface ITopic extends IPersistedModel {
    type: TTopicType
}

export interface ITopicInstance extends IPersistedModelInstance {
    id: number
}

module.exports = function (Topic: ITopic) {
};
