import promisify from 'pz-support/src/promisify';
import {createRecordFromLoopback} from 'pz-server/src/support/repository';
import {IPhotoInstance, IPhotoModel} from 'pz-server/src/models/photo';
import {IPhoto, IPhotos, TPurposeType} from 'pz-server/src/photos/photos';
import {loopbackFindAllByIds} from 'pz-server/src/support/loopback-find-all-helpers';
import {IDeletedPhotoModel} from 'pz-server/src/models/deleted-photo';
import {ICursorResults} from 'pz-server/src/support/cursors/cursors';
import {cursorLoopbackModelsToRecords} from 'pz-server/src/support/cursors/repository-helpers';

export function createRecordFromLoopbackPhoto(photo: IPhotoInstance): IPhoto {
    return createRecordFromLoopback<IPhoto>('Photo', photo);
}

export function createRecordsFromLoopbackPhotos(photoModels: Array<IPhotoInstance>): Array<IPhoto> {
    return photoModels.map(photoModel => createRecordFromLoopbackPhoto(photoModel));
}

export function cursorPhotoLoopbackModelsToRecords(photos: ICursorResults<IPhotoInstance>): ICursorResults<IPhoto> {
    return cursorLoopbackModelsToRecords<IPhoto>('Photo', photos);
}

export default class LoopbackPhotos implements IPhotos {
    private _PhotoModel: IPhotoModel;
    private _DeletedPhotoModel: IDeletedPhotoModel;

    constructor(PhotoModel: IPhotoModel, DeletedPhotoModel: IDeletedPhotoModel) {
        this._PhotoModel = PhotoModel;
        this._DeletedPhotoModel = DeletedPhotoModel;
    }

    async findById(id: number): Promise<IPhoto> {
        const model = await promisify(this._PhotoModel.findById, this._PhotoModel)(id);
        return createRecordFromLoopbackPhoto(model);
    }

    async findAllByIds(ids: Array<number>): Promise<Array<IPhoto>> {
        const photoModels = await loopbackFindAllByIds<IPhotoModel, IPhotoInstance>(
            this._PhotoModel,
            ids
        );

        return photoModels.map(photoModel => {
            return createRecordFromLoopbackPhoto(photoModel);
        });
    }

    async findAllByParentAndPurposeType(parentType: string, parentId: number, purposeType: string): Promise<Array<IPhoto>> {
        const find = promisify(this._PhotoModel.find, this._PhotoModel);

        const photoModels: Array<IPhotoInstance> = await find({
            where: {
                parentType,
                parentId,
                purposeType
            }
        });

        return photoModels.map(photoModel => {
            return createRecordFromLoopbackPhoto(photoModel);
        });
    }

    async createUploadingPhoto(photo: IPhoto): Promise<IPhoto> {
        const loopbackPhotoData = {
            userId: photo.userId,
            purposeType: photo.purposeType,
            parentType: photo.parentType,
            parentId: photo.parentId,
            isUploaded: false
        };

        const model = new this._PhotoModel(loopbackPhotoData);
        const resultModel = await promisify(model.save, model)();
        return createRecordFromLoopbackPhoto(resultModel);
    }

    async updateToUploadedPhoto(id: number, photoServerPath: string): Promise<IPhoto> {
        const model = await promisify<IPhotoInstance>(this._PhotoModel.findById, this._PhotoModel)(id);

        if (!model) {
            throw new Error('Cannot find photo by id: ' + id);
        }

        model.isUploaded = true;
        model.photoServerPath = photoServerPath;

        const updatedModel = await promisify<IPhotoInstance>(model.save, model)();
        return createRecordFromLoopbackPhoto(updatedModel);
    }

    async update(photo: IPhoto): Promise<IPhoto> {
        if (!photo.id) {
            throw new Error('Cannot update record without an id');
        }

        let photoModel: IPhotoInstance = await promisify(
            this._PhotoModel.findById, this._PhotoModel)(photo.id);

        if (!photoModel) {
            throw new Error('Could not find photo: ' + photo.id);
        }

        photoModel.userId = photo.userId;
        photoModel.parentType = photo.parentType;
        photoModel.parentId = photo.parentId;
        photoModel.purposeType = photo.purposeType;
        photoModel.isUploaded = photo.isUploaded;
        photoModel.photoServerPath = photo.photoServerPath;

        const updatedPhoto = await promisify(photoModel.save, photoModel)();
        return createRecordFromLoopbackPhoto(updatedPhoto);
    }

    async destroy(id: number): Promise<IPhoto> {
        const model = await promisify<IPhotoInstance>(this._PhotoModel.findById, this._PhotoModel)(id);

        if (!model) {
            throw new Error('Cannot find photo by id: ' + id);
        }

        const photo = createRecordFromLoopbackPhoto(model);

        await promisify(model.destroy, model)();
        const deletedPhoto = new this._DeletedPhotoModel(Object.assign({}, photo));
        await promisify(deletedPhoto.save, deletedPhoto)();

        return photo;
    }
}
