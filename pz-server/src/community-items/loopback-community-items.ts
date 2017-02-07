import {createRecordFromLoopback} from 'pz-server/src/support/repository';
import {IUrlSlugInstance} from 'pz-server/src/url-slugs/models/url-slug';

import promisify from 'pz-support/src/promisify';
import isOwnerOfModel from 'pz-server/src/support/is-owner-of-model';
import {
    ICommunityItem, ICommunityItems,
    ICommunityItemInteraction, ICommunityItemsBatchable
} from 'pz-server/src/community-items/community-items';
import {ITopicInstance} from 'pz-server/src/models/topic';
import {ITopic} from 'pz-server/src/topics/topics';
import {IComment} from 'pz-server/src/comments/comments';
import {ICommunityItemModel, ICommunityItemInstance} from 'pz-server/src/models/community-item'; 
import {IVote} from 'pz-server/src/votes/votes';
import {IVoteInstance} from 'pz-server/src/models/vote';

import {
    ICursorResults, TBiCursor,
    createEmptyCursorResults
} from 'pz-server/src/support/cursors/cursors';

import {findWithCursor} from 'pz-server/src/support/cursors/loopback-helpers';
import {cursorLoopbackModelsToRecords} from 'pz-server/src/support/cursors/repository-helpers';
import {
    loopbackFindAllByIds,
    loopbackFindAllForEach
} from 'pz-server/src/support/loopback-find-all-helpers';
import {
    ICommunityItemInteractionModel,
    ICommunityItemInteractionInstance
} from 'pz-server/src/models/community-item-interaction';

import {IPhoto} from 'pz-server/src/photos/photos';
import {IPhotoModel as ILoopbackPhoto, IPhotoInstance as ILoopbackPhotoInstance} from 'pz-server/src/models/photo';

import {
    createRecordFromLoopbackPhoto
} from 'pz-server/src/photos/loopback-photos';

import {IContentData, isDraftJs08Content} from 'pz-server/src/content/content-data';
import {extractPhotoAttachments} from 'pz-server/src/content/filters/attachment-data';

export function createRecordFromLoopbackCommunityItem(communityItem: ICommunityItemInstance): ICommunityItem {
    return createRecordFromLoopback<ICommunityItem>('CommunityItem', communityItem);
}

export function cursorCommunityItemLoopbackModelsToRecords(communityItems: ICursorResults<ICommunityItemInstance>): ICursorResults<ICommunityItem> {
    return cursorLoopbackModelsToRecords<ICommunityItem>('CommunityItem', communityItems);
}

export function createRecordFromLoopbackCommunityItemInteraction(communityItemInteraction: ICommunityItemInteractionInstance): ICommunityItemInteraction {
    return createRecordFromLoopback<ICommunityItemInteraction>('CommunityItemInteraction', communityItemInteraction);
}

export default class CommunityItems implements ICommunityItems, ICommunityItemsBatchable {
    private _CommunityItemModel: ICommunityItemModel;
    private _CommunityItemInteractionModel: ICommunityItemInteractionModel;
    private _UrlSlugsModel: IPersistedModel;
    private _Photo: ILoopbackPhoto;

    constructor(
        CommunityItemModel: ICommunityItemModel,
        CommunityItemInteractionModel: ICommunityItemInteractionModel,
        UrlSlug: IPersistedModel,
        Photo: ILoopbackPhoto,
    ) {

        this._CommunityItemModel = CommunityItemModel;
        this._CommunityItemInteractionModel = CommunityItemInteractionModel;
        this._UrlSlugsModel = UrlSlug;
        this._Photo = Photo;
    }

    async findById(id: number): Promise<ICommunityItem> {
        const communityItemModel = await promisify(
            this._CommunityItemModel.findById, this._CommunityItemModel)(id);

        if (!communityItemModel) {
            return null;
        }

        return createRecordFromLoopbackCommunityItem(communityItemModel);
    }

    async findAllByIds(ids: Array<number>): Promise<Array<ICommunityItem>> {
        const communityItemModels = await loopbackFindAllByIds<ICommunityItemModel, ICommunityItemInstance>(
            this._CommunityItemModel,
            ids
        );

        return communityItemModels.map(communityItemModel => {
            if (!communityItemModel) {
                return null;
            }

            return createRecordFromLoopbackCommunityItem(communityItemModel);
        });
    }

    async findSomeByLatest(cursor: TBiCursor): Promise<ICursorResults<ICommunityItem>> {
        const cursorResults = await findWithCursor<ICommunityItemInstance>(
            this._CommunityItemModel,
            cursor,
            { order: 'createdAt DESC' }
        );

        return cursorCommunityItemLoopbackModelsToRecords(cursorResults);
    }

    async findSomeLatestByUserId(cursor: TBiCursor, userId: number): Promise<ICursorResults<ICommunityItem>> {
        const cursorResults = await findWithCursor<ICommunityItemInstance>(
            this._CommunityItemModel,
            cursor,
            {
                where: { userId },
                order: 'createdAt DESC'
            }
        );

        return cursorCommunityItemLoopbackModelsToRecords(cursorResults);
    }

    async findVotesForCommunityItem(communityItemId: number): Promise<Array<IVote>> {
        const communityItemModel: ICommunityItemInstance = await promisify(
            this._CommunityItemModel.findById, this._CommunityItemModel)(communityItemId);

        const votes = await promisify<IVoteInstance[]>(
            communityItemModel.votes, communityItemModel)();

        return votes.map((vote) =>
            createRecordFromLoopback<IVote>('Vote', vote)
        );
    }

    isOwner(userId: number, communityItemId: number): Promise<boolean> {
        return isOwnerOfModel(userId, this._CommunityItemModel, communityItemId);
    }

    async findAllTopics(communityItemId: number): Promise<Array<ITopic>> {
        const communityItem: ICommunityItemInstance = await (promisify(
            this._CommunityItemModel.findById, this._CommunityItemModel)(communityItemId));

        const topicModels = await promisify<ITopicInstance[]>(
            communityItem.topics, communityItem)({});

        return topicModels.map((topic) =>
            createRecordFromLoopback<ITopic>('Topic', topic)
        );
    }

    async findAllComments(communityItemId: number): Promise<Array<IComment>> {
        const communityItemModel: ICommunityItemInstance = await promisify(
            this._CommunityItemModel.findById, this._CommunityItemModel)(communityItemId);

        const comments = await promisify(
            communityItemModel.comments, communityItemModel)();

        return comments.map((comment) =>
            createRecordFromLoopback<IComment>('Comment', comment)
        );
    }

    async findByUrlSlugName(fullSlug: string): Promise<ICommunityItem> {
        let urlSlug: IUrlSlugInstance = await promisify(this._UrlSlugsModel.findOne, this._UrlSlugsModel)({
            where: {
                sluggableType: this._CommunityItemModel.sluggableType,
                fullSlugLowercase: fullSlug.toLowerCase()
            }
        });

        if (urlSlug) {
            const result = await promisify(this._CommunityItemModel.findById, this._CommunityItemModel)(
                urlSlug.sluggableId);

            return createRecordFromLoopbackCommunityItem(result);
        }

        const id = Number(fullSlug);
        if (!Number.isInteger(id) || id < 1) {
            return null;
        }

        const result = await promisify(this._CommunityItemModel.findById, this._CommunityItemModel)(id);

        if (!result) {
            return null;
        }

        return createRecordFromLoopbackCommunityItem(result);
    }

    async findInteraction(communityItemId: number, userId: number): Promise<ICommunityItemInteraction> {
        const interactionFinder = await promisify<ICommunityItemInteractionInstance>(
            this._CommunityItemInteractionModel.findOne, this._CommunityItemInteractionModel);

        let interactionModel = await interactionFinder({where: {
                communityItemId: communityItemId,
                userId: userId
            }});

        if (!interactionModel) {
            return null;
        }

        return createRecordFromLoopbackCommunityItemInteraction(interactionModel);
    }

    async findAllInteractionsForEach(communityItemUserIds: Array<[number, number]>): Promise<Array<ICommunityItemInteraction>> {
        const interactionModels = await loopbackFindAllForEach<ICommunityItemInteractionModel, ICommunityItemInteractionInstance>
            (
            this._CommunityItemInteractionModel,
            ['communityItemId', 'userId'],
            communityItemUserIds
            );

        return interactionModels.map(interactionModel => {
            if (!interactionModel) {
                return null;
            }

            return createRecordFromLoopbackCommunityItemInteraction(interactionModel);
        });
    }

    // Using body data here instead of the community item ID is useful to ensure the
    // order of the photos returned in the look up is the same as the order of
    // the photos in the body data.
    async findAllPhotosByBodyData(bodyData: IContentData): Promise<Array<IPhoto>> {
        if (!bodyData || !isDraftJs08Content(bodyData)) {
            return [];
        }

        const photoAttachments = extractPhotoAttachments(bodyData.value);

        if (!photoAttachments.length) {
            return [];
        }

        const photoIds = photoAttachments.map(attachment => attachment.id);

        const photoModels = await promisify(this._Photo.find, this._Photo)({
            where: {
                id: {inq: photoIds},
                parentType: 'CommunityItem'
            }
        });

        const photoModelMap = new Map<number, ILoopbackPhotoInstance>(photoModels.map(
            photoModel => [photoModel.id, photoModel]
        ));

        return photoIds.reduce<Array<IPhoto>>((photos, photoId) => {
            const photoModel = photoModelMap.get(photoId);

            if (!photoModel) {
                return photos;
            }

            photos.push(createRecordFromLoopbackPhoto(photoModel));

            return photos;

        }, []);
    }

    async getReputationEarned(communityItemId: number, userId: number): Promise<number> {
        return await this._CommunityItemModel.getReputationEarned(communityItemId, userId);
    }

    async create(communityItem: ICommunityItem, ownerId: number): Promise<ICommunityItem> {
        let communityItemModel = new this._CommunityItemModel({
            type: communityItem.type,
            summary: communityItem.summary,
            body: communityItem.body,
            bodyData: communityItem.bodyData,
            userId: ownerId
        });

        const result = await promisify<ICommunityItemInstance>(communityItemModel.save, communityItemModel)();

        const topicPromises = (communityItem.topics as Array<any>).map((topic) => {
            return promisify(result.topics.add, result)(topic);
        });

        await Promise.all(topicPromises);

        return createRecordFromLoopbackCommunityItem(result);
    }

    async update(communityItem: ICommunityItem): Promise<ICommunityItem> {
        if (!communityItem.id) {
            throw new Error('Cannot update record without an id');
        }

        let communityItemModel: ICommunityItemInstance = await promisify(
            this._CommunityItemModel.findById, this._CommunityItemModel)(communityItem.id);

        if (!communityItemModel) {
            throw new Error('Could not find community item: ' + communityItem.id);
        }

        communityItemModel.type = communityItem.type;
        communityItemModel.summary = communityItem.summary;
        communityItemModel.body = communityItem.body;
        communityItemModel.bodyData = communityItem.bodyData;

        const result = await promisify(communityItemModel.save, communityItemModel)();
        return createRecordFromLoopbackCommunityItem(result);
    }

    async updateInteraction(interaction: ICommunityItemInteraction): Promise<ICommunityItemInteraction> {
        if (!interaction.communityItemId || !interaction.userId) {
            throw new Error('Cannot update interaction without a community item and user id');
        }

        const interactionFinder = await promisify<ICommunityItemInteractionInstance>(
            this._CommunityItemInteractionModel.findOne, this._CommunityItemInteractionModel);

        let interactionModel = await interactionFinder({where: {
                communityItemId: interaction.communityItemId,
                userId: interaction.userId
            }});

        if (!interactionModel) {
            interactionModel = new this._CommunityItemInteractionModel({
                communityItemId: interaction.communityItemId,
                userId: interaction.userId
            }) as ICommunityItemInteractionInstance;
        }

        if (interaction.hasOwnProperty('hasMarkedRead')) {
            interactionModel.hasMarkedRead = interaction.hasMarkedRead;
        }

        const result = await promisify(interactionModel.save, interactionModel)();
        return createRecordFromLoopbackCommunityItemInteraction(result);
    }

    async destroy(communityItem: ICommunityItem): Promise<void> {
        // TODO: Time to switch to Sequelize?
        throw new Error('Saving this for another day :)');
    }
}

