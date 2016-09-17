import promisify from 'pz-support/src/promisify';
import {createRecordFromLoopback} from 'pz-server/src/support/repository';
import {IPhotoInstance, IPhotoModel} from 'pz-server/src/models/photo';
import {IPhoto, IPhotos} from 'pz-server/src/photos/photos';

export function createRecordFromLoopbackPhoto(photo: IPhotoInstance): IPhoto {
    return createRecordFromLoopback<IPhoto>('Photo', photo);
}

export default class LoopbackPhotos implements IPhotos {
    private _PhotoModel: IPhotoModel;

    constructor(PhotoModel: IPhotoModel) {
        this._PhotoModel = PhotoModel;
    }

    async findById(id: number): Promise<IPhoto> {
        const model = await promisify(this._PhotoModel.findById, this._PhotoModel)(id);
        return createRecordFromLoopbackPhoto(model);
    }

    async findAllByIds(ids: Array<number>): Promise<Array<IPhoto>> {
        const find = promisify(this._PhotoModel.find, this._PhotoModel);

        const photoModels = await find({
            where: { id: {inq: ids} }
        });

        return photoModels.map(photoModel => {
            return createRecordFromLoopbackPhoto(photoModel);
        });
    }

    async createUploadingPhoto(userId: number): Promise<IPhoto> {
        const model = new this._PhotoModel({userId});
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
}
