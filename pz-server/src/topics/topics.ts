import {
    IRepository,
    IRepositoryRecord
} from 'pz-server/src/support/repository';

import {ICommunityItem} from 'pz-server/src/community-items/community-items';
import {TBiCursor, ICursorResults} from 'pz-server/src/support/cursors/cursors';
import {TOptionalUser} from 'pz-server/src/users/users';

export type TTopicType = (
    'topic'
    | 'brand'
    | 'product'
);

export interface ITopic extends IRepositoryRecord {
    recordType: 'Topic'

    id?: number
    type: TTopicType
    name: string
    description?: string
    thumbnailPath?: string
    overviewContent?: string
    isVerified?: boolean
    communityItems?: Array<ICommunityItem>
}

export interface ITopics extends IRepository {
    findAll(): Promise<Array<ITopic>>
    findById(id: number): Promise<ITopic>
    findAllByIds(ids: Array<number>): Promise<Array<ITopic>>
    findByUrlSlugName(urlSlugName: string): Promise<ITopic>
    findSomeCommunityItemsRanked(topicId: number, asUser: TOptionalUser, cursor: TBiCursor): Promise<ICursorResults<ICommunityItem>>
    findAllCommunityItemIds(topicId: number): Promise<Array<number>>
    getCommunityItemCount(topicId: number): Promise<number>
}

export interface ITopicsBatchable {
    findAllByIds(ids: Array<number>): Promise<Array<ITopic>>
}
