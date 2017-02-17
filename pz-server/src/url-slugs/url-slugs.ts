import {
    IRepository, IRepositoryRecord
} from 'pz-server/src/support/repository';

export type TSluggableType = string;
export type TSluggableId = number;

export interface ISluggable {
    sluggableType: TSluggableType,
    sluggableId: TSluggableId
}

export interface IUrlSlug extends IRepositoryRecord {
    recordType: 'UrlSlug'
    fullSlug: string
    isAlias: boolean
    sluggableType: TSluggableType,
    sluggableId: TSluggableId
    createdAt: Date
}

export interface IUrlSlugs extends IRepository {
    findAllBySluggable(sluggable: ISluggable): Promise<Array<IUrlSlug>>
    findAllForEachSluggable(sluggables: Array<ISluggable>): Promise<Array<Array<IUrlSlug>>>
    findAllNonAliasForEachSluggable(sluggables: Array<ISluggable>): Promise<Array<Array<IUrlSlug>>>
}
