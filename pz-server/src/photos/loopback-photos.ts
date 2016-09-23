import promisify from 'pz-support/src/promisify';
import {createRecordFromLoopback} from 'pz-server/src/support/repository';
import {IPhotoInstance, IPhotoModel} from 'pz-server/src/models/photo';
import {IPhoto, IPhotos, TPurposeType} from 'pz-server/src/photos/photos';
import {loopbackFindAllByIds} from 'pz-server/src/support/loopback-find-all-helpers';
import {IDeletedPhotoModel} from 'pz-server/src/models/deleted-photo';

export function createRecordFromLoopbackPhoto(photo: IPhotoInstance): IPhoto {
    return createRecordFromLoopback<IPhoto>('Photo', photo);
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
