import {ITopic} from 'pz-server/src/topics/topics';
import {IComment} from 'pz-server/src/comments/comments';
import {IRepository, IRepositoryRecord} from 'pz-server/src/support/repository';
import {IVote} from 'pz-server/src/votes/votes';

import {
    ICursorResults, TBiCursor
} from 'pz-server/src/support/cursors/cursors';

import {IContentData} from 'pz-server/src/content/content-data';

export type TCommunityItemType = (
    'General'
    | 'Review'
    | 'Question'
    | 'Guide'
    | 'Comparison'
);

export interface ICommunityItem extends IRepositoryRecord {
    recordType: 'CommunityItem'

    id?: number
    userId?: number
    type?: TCommunityItemType
    summary?: string
    body?: string
    bodyData?: IContentData
    createdAt?: Date
    updatedAt?: Date
    comments?: any
    votes?: any
    topics?: ITopic[]
}

export interface ICommunityItems extends IRepository {
    findById(id: number): Promise<ICommunityItem>
    findAllByIds(ids: Array<number>): Promise<Array<ICommunityItem>>
    findSomeByUserId(cursor: TBiCursor, userId: number): Promise<ICursorResults<ICommunityItem>>
    findAllTopics(communityItemId: number): Promise<Array<ITopic>>
    findAllComments(communityItemId: number): Promise<Array<IComment>>
    findVotesForCommunityItem(communityItemId: number): Promise<Array<IVote>>
    findByUrlSlugName(fullSlug: string): Promise<ICommunityItem>
    isOwner(userId: number, communityItemId: number): Promise<boolean>
    create(communityItem: ICommunityItem, ownerId: number): Promise<ICommunityItem>
    update(communityItem: ICommunityItem): Promise<ICommunityItem>
}

export interface ICommunityItemsBatchable {
    findAllByIds(ids: Array<number>): Promise<Array<ICommunityItem>>
}
