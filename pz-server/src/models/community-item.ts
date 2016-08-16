import {ISluggable, ISluggableInstance} from 'pz-server/src/url-slugs/mixins/sluggable';
import {ICommunityItem} from 'pz-server/src/community-items/community-items';
import {ITopicInstance} from 'pz-server/src/models/topic';
import {ICommentInstance} from 'pz-server/src/models/comment';
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

export interface ICommunityItemModel extends IPersistedModel, ISluggable {
    type: TCommunityItemType
}

export interface ICommunityItemInstance extends IPersistedModelInstance, ISluggableInstance, ICommunityItem {
    id: number
    summary: string
    body: string
    bodyData: IContentData
    createdAt: Date
    updatedAt: Date
    topics: IRelatedPersistedModel<ITopicInstance[]>
    comments?: IRelatedPersistedModel<ICommentInstance[]>
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
