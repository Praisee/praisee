import {IPhotos, IPhoto, TPurposeType} from 'pz-server/src/photos/photos';
import {EventEmitter} from 'events';

// TODO: This should renamed to PhotosMiddleware and handle each event handler in
// TODO: a sequential order to ensure data integrity.

export interface IPhotosEvents extends IPhotos {
    onPhotoAvailable(listener: (photo: IPhoto) => any): void
    offPhotoAvailable(listener: (photo: IPhoto) => any): void

    onPhotoDestroyed(listener: (photo: IPhoto) => any): void
    offPhotoDestroyed(listener: (photo: IPhoto) => any): void
}

export default class PhotosEvents implements IPhotos {
    private _photos: IPhotos;

    private _events = new EventEmitter();

    constructor(photos: IPhotos) {
        this._photos = photos;
    }

    findById(id: number): Promise<IPhoto> {
        return this._photos.findById(id);
    }

    findAllByIds(ids: Array<number>): Promise<Array<IPhoto>> {
        return this._photos.findAllByIds(ids);
    }

    findAllByParentAndPurposeType(parentType: string, parentId: number, purposeType: string): Promise<Array<IPhoto>> {
        return this._photos.findAllByParentAndPurposeType(parentType, parentId, purposeType);
    }

    createUploadingPhoto(photo: IPhoto): Promise<IPhoto> {
        return this._photos.createUploadingPhoto(photo);
    }

    async updateToUploadedPhoto(id: number, photoServerPath: string): Promise<IPhoto> {
        const photo = await this._photos.updateToUploadedPhoto(id, photoServerPath);

        if (!photo) {
            throw new Error('Invalid photo provided from updateToUploadedPhoto');
        }

        this._events.emit('photoAvailable', photo);
        return photo;
    }

    update(photo: IPhoto): Promise<IPhoto> {
        return this._photos.update(photo);
    }

    async destroy(id: number): Promise<IPhoto> {
        const photo = await this._photos.destroy(id);

        if (!photo) {
            throw new Error('Invalid photo provided from destroy');
        }

        this._events.emit('photoDestroyed', photo);
        return photo;
    }

    onPhotoAvailable(listener: (photo: IPhoto) => any): void {
        this._events.addListener('photoAvailable', listener);
    }

    offPhotoAvailable(listener: (photo: IPhoto) => any): void {
        this._events.removeListener('photoAvailable', listener);
    }

    onPhotoDestroyed(listener: (photo: IPhoto) => any): void {
        this._events.addListener('photoDestroyed', listener);
    }

    offPhotoDestroyed(listener: (photo: IPhoto) => any): void {
        this._events.removeListener('photoDestroyed', listener);
    }
}
