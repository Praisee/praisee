import {
    IRepository,
    IRepositoryRecord
} from 'pz-server/src/support/repository';

import {ICommunityItem} from 'pz-server/src/community-items/community-items';
import {TBiCursor, ICursorResults} from 'pz-server/src/support/cursors/cursors';
import {TOptionalUser} from 'pz-server/src/users/users';
import {IPhoto} from 'pz-server/src/photos/photos';

export interface ITopic extends IRepositoryRecord {
    recordType: 'Topic'

    id?: number
    name: string
    description?: string
    thumbnailPath?: string
    overviewContent?: string
    isVerified?: boolean
    isCategory?: boolean
    communityItems?: Array<ICommunityItem>
}

export interface ITopics extends IRepository {
    findAll(): Promise<Array<ITopic>>
    findById(id: number): Promise<ITopic>
    findAllByIds(ids: Array<number>): Promise<Array<ITopic>>
    findByUrlSlugName(urlSlugName: string): Promise<ITopic>
    findTopTenCategoriesByReviews(): Promise<Array<ITopic>>
    findTopTenReviewedTopicsByCategoryId(id: number): Promise<Array<ITopic>>
    findSomeCommunityItemsRanked(topicId: number, asUser: TOptionalUser, cursor: TBiCursor): Promise<ICursorResults<ICommunityItem>>
    findSomePhotoGalleryPhotosRanked(topicId: number, asUser: TOptionalUser, cursor: TBiCursor): Promise<ICursorResults<IPhoto>>
    findAllCommunityItemIds(topicId: number): Promise<Array<number>>
    getCommunityItemCount(topicId: number): Promise<number>
    createAllByNames(topicNames: Array<string>): Promise<Array<ITopic>>
    getAverageRatingById(id: number): Promise<number | null>
}

export interface ITopicsBatchable {
    findAllByIds(ids: Array<number>): Promise<Array<ITopic>>
}
