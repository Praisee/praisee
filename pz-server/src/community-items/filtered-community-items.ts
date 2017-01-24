import {
    ICommunityItems, ICommunityItem,
    ICommunityItemInteraction
} from 'pz-server/src/community-items/community-items';
import {
    IDataToTextConverter,
    IContentData,
    isDraftJs08Content,
    IDraftjs08Content
} from 'pz-server/src/content/content-data';
import {ITopic} from 'pz-server/src/topics/topics';
import {TBiCursor, ICursorResults} from 'pz-server/src/support/cursors/cursors';
import {IContentFilterer} from 'pz-server/src/content/content-filterer';
import {promisedMapCursorResults} from 'pz-server/src/support/cursors/map-cursor-results';
import {IComment} from 'pz-server/src/comments/comments';
import {IVote} from 'pz-server/src/votes/votes';
import {IPhotos, IPhoto} from 'pz-server/src/photos/photos';
import {filterAttachments} from 'pz-server/src/content/filters/attachment-data';
import {
    IAttachment,
    isPhotoAttachment
} from 'pz-client/src/editor/attachment-plugin/attachment';

export default class FilteredCommunityItems implements ICommunityItems {
    private _communityItems: ICommunityItems;
    private _photos: IPhotos;
    private _contentFilterer: IContentFilterer;
    private _convertBodyDataToText: IDataToTextConverter;

    constructor(
            CommunityItems: ICommunityItems,
            photos: IPhotos,
            contentFilterer: IContentFilterer,
            convertBodyDataToText: IDataToTextConverter
        ) {

        this._communityItems = CommunityItems;
        this._photos = photos;
        this._contentFilterer = contentFilterer;
        this._convertBodyDataToText = convertBodyDataToText;
    }

    async findById(id: number): Promise<ICommunityItem> {
        const communityItem = await this._communityItems.findById(id);
        return await this._filterBeforeRead(communityItem);
    }

    async findAllByIds(ids: Array<number>): Promise<Array<ICommunityItem>> {
        const communityItems = await this._communityItems.findAllByIds(ids);

        return await Promise.all<ICommunityItem>(communityItems.map(async (communityItem) => {
            return await this._filterBeforeRead(communityItem);
        }));
    }

    async findSomeByUserId(cursor: TBiCursor, userId: number): Promise<ICursorResults<ICommunityItem>> {
        const filteredCursorResults = await promisedMapCursorResults(
            await this._communityItems.findSomeByUserId(cursor, userId),
            async (cursorResult) => Object.assign({}, cursorResult, {
                item: await this._filterBeforeRead(cursorResult.item)
            })
        );

        return filteredCursorResults;
    }

    async isOwner(userId: number, communityItemId: number): Promise<boolean> {
        return await this._communityItems.isOwner(userId, communityItemId);
    }

    async findAllTopics(communityItemId: number): Promise<Array<ITopic>> {
        return await this._communityItems.findAllTopics(communityItemId);
    }

    async findAllComments(communityItemId: number): Promise<Array<IComment>> {
        return await this._communityItems.findAllComments(communityItemId);
    }

    async findVotesForCommunityItem(communityItemId: number): Promise<Array<IVote>> {
        return await this._communityItems.findVotesForCommunityItem(communityItemId);
    }

    async findByUrlSlugName(fullSlug: string): Promise<ICommunityItem> {
        return await this._communityItems.findByUrlSlugName(fullSlug);
    }

    findInteraction(communityItemId: number, userId: number): Promise<ICommunityItemInteraction> {
        return this._communityItems.findInteraction(communityItemId, userId);
    }

    findSomePhotosById(id: number, cursor: TBiCursor): Promise<ICursorResults<IPhoto>> {
        return this._communityItems.findSomePhotosById(id, cursor);
    }

    async getReputationEarned(communityItemId: number, userId: number): Promise<number>{
        return await this._communityItems.getReputationEarned(communityItemId, userId);
    }

    async create(communityItem: ICommunityItem, ownerId: number): Promise<ICommunityItem> {
        let filteredBodyData = await this._contentFilterer.filterBeforeWrite(
            communityItem.bodyData
        );

        let newCommunityItem;

        if (isDraftJs08Content(filteredBodyData)) {
            const {bodyData, contentPhotosMap} = await this._extractAndCleanPhotoData(
                filteredBodyData, ownerId
            );

            filteredBodyData = bodyData;

            newCommunityItem = await this._communityItems.create(
                this._filterBeforeWrite(communityItem, filteredBodyData),
                ownerId
            );

            await this._updateLinkedPhotos(newCommunityItem.id, [...contentPhotosMap.values()]);

        } else {
            newCommunityItem = await this._communityItems.create(
                this._filterBeforeWrite(communityItem, filteredBodyData),
                ownerId
            );
        }

        return await this._filterBeforeRead(newCommunityItem);
    }

    async update(communityItem: ICommunityItem): Promise<ICommunityItem> {
        const existingCommunityItem = await this._communityItems.findById(communityItem.id);

        if (!existingCommunityItem) {
            throw new Error('Community item does not exist: ' + communityItem.id);
        }

        let filteredBodyData = await this._contentFilterer.filterBeforeWrite(
            communityItem.bodyData
        );

        let updatedCommunityItem;

        if (isDraftJs08Content(filteredBodyData)) {
            const {bodyData, contentPhotosMap} = await this._extractAndCleanPhotoData(
                filteredBodyData, existingCommunityItem.userId, existingCommunityItem.id
            );

            filteredBodyData = bodyData;

            const {addedPhotos, removedPhotos} = await this._getAddedAndRemovedPhotos(
                communityItem.id, contentPhotosMap
            );

            updatedCommunityItem = await this._communityItems.update(
                this._filterBeforeWrite(communityItem, filteredBodyData)
            );

            await Promise.all([
                this._updateLinkedPhotos(updatedCommunityItem.id, addedPhotos),
                this._destroyUnlinkedPhotos(removedPhotos)
            ]);

        } else {
            updatedCommunityItem = await this._communityItems.update(
                this._filterBeforeWrite(communityItem, filteredBodyData)
            );
        }

        return await this._filterBeforeRead(updatedCommunityItem);
    }

    updateInteraction(interaction: ICommunityItemInteraction): Promise<ICommunityItemInteraction> {
        return this._communityItems.updateInteraction(interaction);
    }

    destroy(communityItem: ICommunityItem): Promise<void> {
        return this._communityItems.destroy(communityItem);
    }

    private async _filterBeforeRead(communityItem: ICommunityItem | null): Promise<ICommunityItem | null> {
        if (!communityItem) {
            return null;
        }

        const filteredBodyData = await this._contentFilterer.filterBeforeRead(
            communityItem.bodyData
        );

        return Object.assign({}, communityItem, {
            bodyData: filteredBodyData
        });
    }

    private _filterBeforeWrite(communityItem: ICommunityItem, filteredBodyData: IContentData): ICommunityItem {
        return Object.assign({}, communityItem, {
            body: this._convertBodyDataToText(filteredBodyData),
            bodyData: filteredBodyData
        });
    }

    private async _extractAndCleanPhotoData(bodyData: IDraftjs08Content, ownerId: number, communityItemId: number = null):
        Promise<{bodyData: IDraftjs08Content, contentPhotosMap: Map<number, IPhoto>}> {

        const contentPhotosMap = new Map<number, IPhoto>();

        const filteredBodyData = Object.assign({}, bodyData, {
            value: await filterAttachments(bodyData.value, async (attachment: IAttachment) => {
                if (!isPhotoAttachment(attachment)) {
                    return attachment;
                }

                const addedPhoto = await this._photos.findById(attachment.id);

                if (!addedPhoto || addedPhoto.userId !== ownerId) {
                    return null;
                }

                if (addedPhoto.parentId) {
                    if (!communityItemId) {
                        return null;
                    }

                    const isForSameContent = (
                        addedPhoto.parentType === 'CommunityItem'
                        && addedPhoto.purposeType === 'CommunityItemContent'
                        && communityItemId === addedPhoto.parentId
                    );

                    if (!isForSameContent) {
                        return null;
                    }
                }

                contentPhotosMap.set(attachment.id, addedPhoto);

                return attachment;
            })
        });

        return {bodyData: filteredBodyData, contentPhotosMap};
    }

    private async _getAddedAndRemovedPhotos(communityItemId: number, contentPhotosMap: Map<number, IPhoto>):
        Promise<{addedPhotos: Array<IPhoto>, removedPhotos: Array<IPhoto>}> {

        const priorPhotos = await this._photos.findAllByParentAndPurposeType(
            'CommunityItem',
            communityItemId,
            'CommunityItemContent'
        );

        const priorPhotosMap = priorPhotos.reduce((priorPhotosMap, priorPhoto) => {
            priorPhotosMap.set(priorPhoto.id, priorPhoto);
            return priorPhotosMap;
        }, new Map<number, IPhoto>());

        const allPhotosMap = new Map<number, IPhoto>([...priorPhotosMap, ...contentPhotosMap]);

        let addedPhotos = [], removedPhotos = [];

        allPhotosMap.forEach((photo) => {
            const photoId = photo.id;
            const priorHasPhoto = priorPhotosMap.has(photoId);
            const currentHasPhoto = contentPhotosMap.has(photoId);

            if (!priorHasPhoto && currentHasPhoto) {
                addedPhotos.push(photo);
            }

            if (priorHasPhoto && !currentHasPhoto) {
                removedPhotos.push(photo);
            }
        });

        return {addedPhotos, removedPhotos};
    }

    private async _updateLinkedPhotos(communityItemId: number, addedPhotos: Array<IPhoto>): Promise<void> {
        const updatePhotoPromises = addedPhotos.map(addedPhoto =>
            this._photos.update(Object.assign({}, addedPhoto, {
                parentType: 'CommunityItem',
                parentId: communityItemId
            }))
        );

        await Promise.all(updatePhotoPromises);
    }

    private async _destroyUnlinkedPhotos(removedPhotos: Array<IPhoto>): Promise<void> {
        const destroyPhotoPromises = removedPhotos.map(removedPhoto =>
            this._photos.destroy(removedPhoto.id)
        );

        await Promise.all(destroyPhotoPromises);
    }
}
