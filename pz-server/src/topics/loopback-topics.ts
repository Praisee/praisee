import promisify from 'pz-support/src/promisify';
import {IUrlSlugInstance} from 'pz-server/src/url-slugs/models/url-slug';

import {
    createRecordFromLoopbackCommunityItem,
    cursorCommunityItemLoopbackModelsToRecords
} from 'pz-server/src/community-items/loopback-community-items';

import {
    ITopicModel as ILoopbackTopic, ITopicInstance as ILookbackTopicInstance
} from 'pz-server/src/models/topic';

import {
    ICommunityItemModel as ILoopbackCommunityItem,
    ICommunityItemInstance as ILoopbackCommunityItemInstance
} from 'pz-server/src/models/community-item';

import {
    TBiCursor, ICursorResults,
    createEmptyCursorResults
} from 'pz-server/src/support/cursors/cursors';

import {ITopics, ITopic, ITopicsBatchable} from 'pz-server/src/topics/topics';
import {createRecordFromLoopback} from 'pz-server/src/support/repository';
import {ICommunityItem} from 'pz-server/src/community-items/community-items';
import {IRankings, RankingsUnavailableError} from 'pz-server/src/rankings/rankings';
import {TOptionalUser} from 'pz-server/src/users/users';
import {findWithCursor} from 'pz-server/src/support/cursors/loopback-helpers';
import {mapCursorResultItems} from 'pz-server/src/support/cursors/map-cursor-results';
import {loopbackFindAllByIds} from 'pz-server/src/support/loopback-find-all-helpers';
import {IPhotosEvents} from 'pz-server/src/photos/photos-events';
import {IPhoto} from 'pz-server/src/photos/photos';
import {IPhotoModel as ILoopbackPhoto, IPhotoInstance as ILoopbackPhotoInstance} from 'pz-server/src/models/photo';
import {cursorPhotoLoopbackModelsToRecords} from 'pz-server/src/photos/loopback-photos';

export function createRecordFromLoopbackTopic(topic: ILookbackTopicInstance): ITopic {
    return createRecordFromLoopback<ITopic>('Topic', topic);
}

export default class LoopbackTopics implements ITopics, ITopicsBatchable {
    private _TopicModel: ILoopbackTopic;
    private _CommunityItemModel: ILoopbackCommunityItem;
    private _UrlSlugsModel: IPersistedModel;
    private _Photo: ILoopbackPhoto;
    private _rankings: IRankings;
    private _photosEvents: IPhotosEvents;

    constructor(
        Topic: ILoopbackTopic,
        CommunityItem: ILoopbackCommunityItem,
        UrlSlug: IPersistedModel,
        Photo: ILoopbackPhoto,
        rankings: IRankings,
        photosEvents: IPhotosEvents
    ) {

        this._TopicModel = Topic;
        this._CommunityItemModel = CommunityItem;
        this._UrlSlugsModel = UrlSlug;
        this._Photo = Photo;
        this._rankings = rankings;
        this._photosEvents = photosEvents;

        this._addPhotosListeners();
    }

    async findAll() {
        const results = await promisify(this._TopicModel.find, this._TopicModel)();
        return results.map(result => createRecordFromLoopbackTopic(result));
    }

    async findById(id: number) {
        const result = await promisify(this._TopicModel.findById, this._TopicModel)(id);
        return createRecordFromLoopbackTopic(result);
    }

    async findAllByIds(ids: Array<number>): Promise<Array<ITopic>> {
        const topicModels = await loopbackFindAllByIds<ILoopbackTopic, ILookbackTopicInstance>(
            this._TopicModel,
            ids
        );

        return topicModels.map(topicModel => {
            return createRecordFromLoopbackTopic(topicModel);
        });
    }

    async findByUrlSlugName(fullSlug: string) {
        let urlSlug: IUrlSlugInstance = await promisify(this._UrlSlugsModel.findOne, this._UrlSlugsModel)({
            where: {
                sluggableType: this._TopicModel.sluggableType,
                fullSlugLowercase: fullSlug.toLowerCase()
            }
        });

        if (urlSlug) {
            const result = await promisify(this._TopicModel.findById, this._TopicModel)(urlSlug.sluggableId);
            return createRecordFromLoopbackTopic(result);
        }

        const topicId = Number(fullSlug);
        if (!Number.isInteger(topicId) || topicId < 1) {
            return null;
        }

        const result = await promisify(this._TopicModel.findById, this._TopicModel)(topicId);

        if (!result) {
            return null;
        }

        return createRecordFromLoopbackTopic(result);
    }

    async findSomeCommunityItemsRanked(topicId: number, asUser: TOptionalUser, cursor: TBiCursor): Promise<ICursorResults<ICommunityItem>> {
        const topic: ILookbackTopicInstance = await promisify(
            this._TopicModel.findById, this._TopicModel)(topicId);

        if (!topic) {
            return createEmptyCursorResults<ICommunityItem>();
        }

        const communityItemRankings = await this._rankings.findSomeTopicCommunityItemIdsAndRanks(
            topicId, asUser, cursor
        );

        // TODO: We need to check the cursor to figure out which path was taken first

        if (communityItemRankings instanceof RankingsUnavailableError) {
            return await this._findSomeCommunityItemsByFilter(cursor, {
                order: 'createdAt DESC'
            });

        } else {

            const ids = communityItemRankings.results.map(({item: [id]}) => id);

            const finder = promisify<ILoopbackCommunityItemInstance[]>(this._CommunityItemModel.find, this._CommunityItemModel);

            const communityItemModels = await finder({
                where: {
                    id: { inq: ids }
                }
            });

            const communityItemMap = communityItemModels.reduce((communityItemMap, communityItem) => {
                communityItemMap[communityItem.id] = communityItem;
                return communityItemMap;
            }, {});

            return mapCursorResultItems(communityItemRankings, ([id]) => {
                return createRecordFromLoopbackCommunityItem(communityItemMap[id]);
            });
        }
    }

    async findSomePhotoGalleryPhotosRanked(topicId: number, asUser: TOptionalUser, cursor: TBiCursor): Promise<ICursorResults<IPhoto>> {
        // TODO: This should be done with a join instead
        const allCommunityItemIds = await this.findAllCommunityItemIds(topicId);

        if (!allCommunityItemIds.length) {
            return createEmptyCursorResults<IPhoto>();
        }

        const photoGalleryPhotos = await findWithCursor<ILoopbackPhotoInstance>(
            this._Photo,
            cursor,
            {
                where: {
                    parentType: 'CommunityItem',
                    parentId: {inq: allCommunityItemIds}
                }
            }
        );

        return cursorPhotoLoopbackModelsToRecords(photoGalleryPhotos);
    }

    async findAllCommunityItemIds(topicId: number): Promise<Array<number>> {
        const topic: ILookbackTopicInstance = await promisify(
            this._TopicModel.findById, this._TopicModel)(topicId);

        const communityItemModels = await promisify(
            topic.communityItems, this._TopicModel)({ fields: { id: true } });

        return communityItemModels.map(communityItemModels => communityItemModels.id);
    }

    async getCommunityItemCount(topicId: number): Promise<number> {
        const count = await this._TopicModel.getCommunityItemCount(topicId);

        return count;
    }

    create(topic: ITopic) {
    }

    private async _findSomeCommunityItemsByFilter(cursor, filter) {
        const communityItems = await findWithCursor<ILoopbackCommunityItemInstance>(
            this._CommunityItemModel,
            cursor,
            filter
        );

        return cursorCommunityItemLoopbackModelsToRecords(communityItems);
    }

    private _addPhotosListeners() {
        this._photosEvents.onPhotoAvailable(async (photo) => {
            if (photo.purposeType !== 'TopicThumbnail') {
                return;
            }

            if (photo.parentType !== 'Topic' || !photo.parentId) {
                console.error('Topic thumbnail with invalid parent: ', JSON.stringify(photo));
                throw new Error('Topic thumbnail does not have correct parent information');
            }

            const topicFinder = promisify(this._TopicModel.findById, this._TopicModel);
            const topic: ILookbackTopicInstance = await topicFinder(photo.parentId);

            if (!topic) {
                throw new Error(`Could not find topic for photo (topicId: ${photo.parentId})`);
            }

            if (topic.thumbnailPhotoPath) {
                throw new Error(`Topic already has a thumbnail (topicId: ${photo.parentId})`);
            }

            topic.thumbnailPhotoPath = photo.photoServerPath;

            await promisify(topic.save, topic)();
        });

        this._photosEvents.onPhotoDestroyed(async (photo) => {
            if (photo.purposeType !== 'TopicThumbnail') {
                return;
            }

            const topicFinder = promisify(this._TopicModel.findById, this._TopicModel);
            const topic: ILookbackTopicInstance = await topicFinder(photo.parentId);

            if (!topic) {
                throw new Error(`Could not find topic for photo (topicId: ${photo.parentId})`);
            }

            topic.thumbnailPhotoPath = null;

            await promisify(topic.save, topic)();
        });
    }
}
