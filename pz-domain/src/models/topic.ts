export type TTopicType = (
    'topic'
        | 'brand'
        | 'product'
    );

export interface ITopic extends IPersistedModel {
    type: TTopicType
}

export interface ITopicInstance extends IPersistedModelInstance {
    id: number,
    name: string,
    description: string
    thumbnailPath: string
    overviewContent: string
    isVerified: boolean
}

module.exports = function (Topic: ITopic) {
};
