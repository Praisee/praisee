import {IPhoto, IPhotos, TPurposeType} from 'pz-server/src/photos/photos';
import DataLoader from 'dataloader';
import createDataLoaderBatcher from 'pz-server/src/support/create-dataloader-batcher';

export default class PhotosLoader implements IPhotos {
    private _photos: IPhotos;

    private _loader: DataLoader<number, IPhoto>;

    constructor(photos: IPhotos) {
        this._photos = photos;
        this._loader = createDataLoaderBatcher<number, IPhoto>(
            this._photos.findAllByIds.bind(this._photos)
        );
    }

    findById(id: number): Promise<IPhoto> {
        return this._loader.load(id);
    }

    findAllByIds(ids: Array<number>): Promise<Array<IPhoto>> {
        return this._loader.loadMany(ids);
    }

    findAllByParentAndPurposeType(parentType: string, parentId: number, purposeType: string): Promise<Array<IPhoto>> {
        return this._photos.findAllByParentAndPurposeType(parentType, parentId, purposeType);
    }

    createUploadingPhoto(photo: IPhoto): Promise<IPhoto> {
        return this._photos.createUploadingPhoto(photo);
    }

    updateToUploadedPhoto(id: number, photoServerPath: string): Promise<IPhoto> {
        return this._photos.updateToUploadedPhoto(id, photoServerPath);
    }

    update(photo: IPhoto): Promise<IPhoto> {
        return this._photos.update(photo);
    }

    destroy(id: number): Promise<IPhoto> {
        return this._photos.destroy(id);
    }
}
