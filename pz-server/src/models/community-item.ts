import {ISluggable, ISluggableInstance} from 'pz-server/src/url-slugs/mixins/sluggable';
import {IContentData, isValidContentData} from 'pz-server/src/content/content-data';
import convertTextToData from 'pz-server/src/content/text-to-data-converter';

export type TCommunityItemType = (
    'comment'
    | 'comparison'
    | 'howto'
    | 'question'
    | 'answer'
    | 'review'
);

export interface ICommunityItem extends IPersistedModel, ISluggable {
    type: TCommunityItemType
    topics: IRelatedPersistedModel
}

export interface ICommunityItemInstance extends IPersistedModelInstance, ISluggableInstance {
    id: number
    summary: string
    body: string
    bodyData: IContentData
    createdAt: Date
    updatedAt: Date
}

module.exports = function (CommunityItem: ICommunityItem) {
    // TODO: This is a temporary fix to add body content data from plain content
    // TODO: everything uses repositories
    CommunityItem.observe('before save', async (context) => {
        const instance = context.instance || context.data;

        if (instance.bodyData || !instance.body) {
            return;
        }

        instance.bodyData = convertTextToData(instance.body);
    });
};
