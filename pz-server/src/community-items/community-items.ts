import {ITopic} from 'pz-server/src/topics/topics';
import {IComment} from 'pz-server/src/comments/comments';
import { IRepository, IRepositoryRecord } from 'pz-server/src/support/repository';

import {
    ICursorResults, TBiCursor
} from 'pz-server/src/support/cursors/cursors';

import {IContentData} from 'pz-server/src/content/content-data';

export type TCommunityItemType = (
    'review'
    | 'question'
    | 'howto'
    | 'comparison'
);

export interface ICommunityItem extends IRepositoryRecord {
    recordType: 'CommunityItem'

    id?: number
    type?: TCommunityItemType
    summary?: string
    body?: string
    bodyData?: IContentData
    createdAt?: Date
    updatedAt?: Date
    comments?: any
}

export interface ICommunityItems extends IRepository {
    findById(id: number): Promise<ICommunityItem>
    findAllByIds(ids: Array<number>): Promise<Array<ICommunityItem>>
    findSomeByUserId(cursor: TBiCursor, userId: number): Promise<ICursorResults<ICommunityItem>>
    findAllTopics(communityItemId: number): Promise<Array<ITopic>>
    findSomeComments(communityItemId: number): Promise<Array<IComment>>
    isOwner(userId: number, communityItemId: number): Promise<boolean>
    create(communityItem: ICommunityItem, ownerId: number): Promise<ICommunityItem>
    update(communityItem: ICommunityItem): Promise<ICommunityItem>
}
