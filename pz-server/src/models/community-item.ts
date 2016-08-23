import {ISluggable, ISluggableInstance} from 'pz-server/src/url-slugs/mixins/sluggable';
import {ITopicInstance} from 'pz-server/src/models/topic';
import {ICommentInstance} from 'pz-server/src/models/comment';
import {IContentData} from 'pz-server/src/content/content-data';
import convertTextToData from 'pz-server/src/content/text-to-data-converter';
import {IVoteInstance} from 'pz-server/src/models/vote';

export type TCommunityItemType = (
    'Comment'
        | 'Comparison'
        | 'Howto'
        | 'Question'
        | 'Review'
    );

export type TLegacyCommunityItemType = (
    'comment'
    | 'comparison'
    | 'howto'
    | 'question'
    | 'review'
);

export interface ICommunityItemModel extends IPersistedModel, ISluggable {
    type: TLegacyCommunityItemType
}

export interface ICommunityItemInstance extends IPersistedModelInstance, ISluggableInstance {
    id: number
    userId: number
    type: TCommunityItemType
    summary: string
    body: string
    bodyData: IContentData
    createdAt: Date
    updatedAt: Date
    topics: IRelatedPersistedModel<ITopicInstance[]>
    comments?: IRelatedPersistedModel<ICommentInstance[]>
    votes?: IRelatedPersistedModel<IVoteInstance[]>
}

module.exports = function (CommunityItem: ICommunityItemModel) {
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
