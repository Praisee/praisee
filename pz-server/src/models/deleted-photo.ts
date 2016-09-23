import {IPhotoModel, IPhotoInstance} from 'pz-server/src/models/photo';

export interface IDeletedPhotoModel extends IPhotoModel {
}

export interface IDeletedPhotoInstance extends IPhotoInstance {
    isPurged: boolean
}
