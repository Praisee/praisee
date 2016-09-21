import promisify from 'pz-support/src/promisify';
import {IUrlSlugs, IUrlSlug, ISluggable} from 'pz-server/src/url-slugs/url-slugs';
import {IUrlSlugInstance, IUrlSlugModel} from 'pz-server/src/url-slugs/models/url-slug';
import {createRecordFromLoopback} from 'pz-server/src/support/repository';

export function createRecordFromLoopbackUrlSlug(urlSlug: IUrlSlugInstance): IUrlSlug {
    return createRecordFromLoopback<IUrlSlug>('UrlSlug', urlSlug);
}

export default class UrlSlugs implements IUrlSlugs {
    private _UrlSlugModel: IUrlSlugModel;

    constructor(UrlSlug: IUrlSlugModel) {
        this._UrlSlugModel = UrlSlug;
    }

    async findAllBySluggable(sluggable: ISluggable): Promise<Array<IUrlSlug>> {
        const find = promisify(this._UrlSlugModel.find, this._UrlSlugModel);
        const {sluggableType, sluggableId} = sluggable;

        const urlSlugModels = await find({
            where: {sluggableType, sluggableId}
        });

        return urlSlugModels.map(urlSlugModel => {
            return createRecordFromLoopbackUrlSlug(urlSlugModel);
        });
    }

    async findAllForEachSluggable(sluggables: Array<ISluggable>): Promise<Array<Array<IUrlSlug>>> {
        if (!sluggables.length) {
            return [];
        }

        let whereGroups = {};

        sluggables.forEach(sluggable => {
            const {sluggableType, sluggableId} = sluggable;

            if (whereGroups.hasOwnProperty(sluggableType)) {
                whereGroups[sluggableType].push(sluggableId);
            } else {
                whereGroups[sluggableType] = [sluggableId];
            }
        });

        let lastSluggableType;

        const whereQuery = Object.keys(whereGroups).reduce((whereQuery: any, sluggableType) => {
            const whereClause = {
                sluggableType,
                sluggableId: {inq: whereGroups[sluggableType]}
            };

            if (lastSluggableType) {
                if (whereQuery.hasOwnProperty('or')) {
                    whereQuery.or.push(whereClause);
                    return whereQuery;
                } else {
                    return {
                        or: [whereQuery, whereClause]
                    };
                }

            } else {

                return whereClause;
            }
        }, {});

        const find = promisify(this._UrlSlugModel.find, this._UrlSlugModel);

        const urlSlugsModels = await find({
            where: whereQuery
        });

        const urlSlugs: Array<IUrlSlug> = urlSlugsModels.map(createRecordFromLoopbackUrlSlug);

        return sluggables.map<Array<IUrlSlug>>(({sluggableType, sluggableId}) => {
            const filteredUrlSlugs = urlSlugs.filter(urlSlug => (
                urlSlug.sluggableType === sluggableType
                && urlSlug.sluggableId === sluggableId
            ));

            return filteredUrlSlugs;
        });
    }
}
