import {IRepository, IRepositoryRecord} from 'pz-server/src/support/repository';

export type TPurposeType = (
    'TopicThumbnail'
    | 'TopicSummary'
    | 'CommunityItemContent'
);

export type TParentType = (
    'Topic'
    | 'User'
    | 'CommunityItem'
);

export interface IPhoto extends IRepositoryRecord {
    id?: number
    userId?: number
    purposeType?:TPurposeType
    parentType?: TParentType
    parentId?: number
    isUploaded?: boolean
    photoServerPath?: string
    createdAt?: Date
    updatedAt?: Date
}

export interface IPhotos extends IRepository {
    findById(id: number): Promise<IPhoto>
    findAllByIds(ids: Array<number>): Promise<Array<IPhoto>>
    findAllByParentAndPurposeType(parentType: string, parentId: number, purposeType: string): Promise<Array<IPhoto>>;
    createUploadingPhoto(photo: IPhoto): Promise<IPhoto>
    updateToUploadedPhoto(id: number, photoServerPath: string): Promise<IPhoto>
    update(photo: IPhoto): Promise<IPhoto>;
    destroy(id: number): Promise<IPhoto>
}
