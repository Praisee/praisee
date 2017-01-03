import {
    ITopic,
    ITopics,
    ITopicsBatchable
} from 'pz-server/src/topics/topics';

import DataLoader from 'dataloader';
import {TOptionalUser} from 'pz-server/src/users/users';
import {ICommunityItem} from 'pz-server/src/community-items/community-items';
import {ICursorResults, TBiCursor} from 'pz-server/src/support/cursors/cursors';
import createDataLoaderBatcher from 'pz-server/src/support/create-dataloader-batcher';
import {IPhoto} from 'pz-server/src/photos/photos';

export default class TopicsLoader implements ITopics {
    private _topics: ITopics & ITopicsBatchable;

    private _loaders: {
        findAllByIds: DataLoader<number, ITopic>
    };

    constructor(topics: ITopics & ITopicsBatchable) {
        this._topics = topics;

        this._loaders = {
            findAllByIds: createDataLoaderBatcher<number, ITopic>(
                this._topics.findAllByIds.bind(this._topics)
            )
        }
    }

    findAll(): Promise<Array<ITopic>> {
        return this._topics.findAll();
    }

    findById(id: number): Promise<ITopic> {
        return this._loaders.findAllByIds.load(id);
    }

    findAllByIds(ids: Array<number>): Promise<Array<ITopic>> {
        return this._loaders.findAllByIds.loadMany(ids);
    }

    findByUrlSlugName(urlSlugName: string): Promise<ITopic> {
        return this._topics.findByUrlSlugName(urlSlugName);
    }

    findSomeCommunityItemsRanked(topicId: number, asUser: TOptionalUser, cursor: TBiCursor): Promise<ICursorResults<ICommunityItem>> {
        return this._topics.findSomeCommunityItemsRanked(topicId, asUser, cursor);
    }

    findSomePhotoGalleryPhotosRanked(topicId: number, asUser: TOptionalUser, cursor: TBiCursor): Promise<ICursorResults<IPhoto>> {
        return this._topics.findSomePhotoGalleryPhotosRanked(topicId, asUser, cursor);
    }

    findTopTenCategoriesByReviews(): Promise<Array<ITopic>> {
        return this._topics.findTopTenCategoriesByReviews();
    }

    findTopTenReviewedTopicsByCategoryId(id: number): Promise<Array<ITopic>> {
        return this._topics.findTopTenReviewedTopicsByCategoryId(id);
    }

    findAllCommunityItemIds(topicId: number): Promise<Array<number>> {
        return this._topics.findAllCommunityItemIds(topicId);
    }

    getCommunityItemCount(topicId: number): Promise<number> {
        return this._topics.getCommunityItemCount(topicId);
    }

    createAllByNames(topicNames: Array<string>): Promise<Array<ITopic>> {
        return this._topics.createAllByNames(topicNames);
    }

    getAverageRatingById(id: number): Promise<number | null> {
        return this._topics.getAverageRatingById(id);
    }
}
