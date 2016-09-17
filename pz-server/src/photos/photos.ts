import {IRepository, IRepositoryRecord} from 'pz-server/src/support/repository';

export interface IPhoto extends IRepositoryRecord {
    id?: number
    userId?: number
    parentType?: string
    parentId?: number
    isUploaded?: boolean
    photoServerPath?: string
    createdAt?: Date
    updatedAt?: Date
}

export interface IPhotos extends IRepository {
    findById(id: number): Promise<IPhoto>
    findAllByIds(ids: Array<number>): Promise<Array<IPhoto>>
    createUploadingPhoto(userId: number): Promise<IPhoto>
    updateToUploadedPhoto(id: number, photoServerPath: string): Promise<IPhoto>
}
