import promisify from 'pz-support/src/promisify';

import routePaths from 'pz-server/src/vanity-route-paths/route-path-templates';

import {
    IRepositoryRecord, IRepository,
    createRecord
} from 'pz-server/src/support/repository';

import {
    IUrlSlug as ILoopbackUrlSlugModel,
    IUrlSlugInstance as ILoopbackUrlSlugModelInstance
} from 'pz-server/src/url-slugs/models/url-slug';

import {IUser} from 'pz-server/src/users/users';
import {ITopic} from 'pz-server/src/topics/topics';
import {ICommunityItem} from 'pz-server/src/community-items/community-items';

export type TVanityRoutePathSupportedRecord = IUser | ITopic | ICommunityItem;

export var isUserRecord = (record: TVanityRoutePathSupportedRecord): record is IUser => (
    record.recordType === 'User'
);

export var isTopicRecord = (record: TVanityRoutePathSupportedRecord): record is ITopic => (
    record.recordType === 'Topic'
);

export var isCommunityItemRecord = (record: TVanityRoutePathSupportedRecord): record is ICommunityItem => (
    record.recordType === 'CommunityItem'
);

export interface IVanityRoutePaths extends IRepository {
    findAllTuplesByRecords(records: Array<TVanityRoutePathSupportedRecord>): Promise<RecordRoutePathTuples>
    findByRecord(record: TVanityRoutePathSupportedRecord): Promise<IVanityRoutePath>
}

export interface IVanityRoutePath extends IRepositoryRecord {
    routePath: string
}

export type RecordVanityRoutePathTuple = [TVanityRoutePathSupportedRecord, IVanityRoutePath];
export type RecordRoutePathTuples = Array<RecordVanityRoutePathTuple>;

type TRecordUrlSlugTuple = [TVanityRoutePathSupportedRecord, ILoopbackUrlSlugModelInstance];

export default class VanityRoutePaths implements IVanityRoutePaths {
    private _UrlSlug: ILoopbackUrlSlugModel;

    constructor(UrlSlug: ILoopbackUrlSlugModel) {
        this._UrlSlug = UrlSlug;
    }

    async findByRecord(record: TVanityRoutePathSupportedRecord): Promise<IVanityRoutePath> {
        const recordToUrlSlugTuples = await this._getRecordToUrlSlugTuples([record]);

        if(!recordToUrlSlugTuples[0]){
            return null;
        }

        const tuple = recordToUrlSlugTuples[0];

        const routePath = createRecord<IVanityRoutePath>('RoutePath', {
            //TODO: Maybe move from tuple to interface to avoid [0]/[1] code
            routePath: this._resolveRoutePath(tuple[0], tuple[1])
        });

        return routePath;
    }

    async findAllTuplesByRecords(records: Array<TVanityRoutePathSupportedRecord>): Promise<RecordRoutePathTuples> {
        const recordToUrlSlugTuples = await this._getRecordToUrlSlugTuples(records);

        return recordToUrlSlugTuples.map<RecordVanityRoutePathTuple>(([record, urlSlug]) => {
            const routePath = createRecord<IVanityRoutePath>('RoutePath', {
                routePath: this._resolveRoutePath(record, urlSlug)
            });

            return [record, routePath];
        });
    }

    private _resolveRoutePath(record: TVanityRoutePathSupportedRecord, urlSlug?: ILoopbackUrlSlugModelInstance): string {
        const urlSlugOrId = urlSlug ? urlSlug.fullSlug : record.id;
        if (isTopicRecord(record)) {
            return routePaths.topic(urlSlugOrId);

        } else if (isUserRecord(record)) {
            return routePaths.user.profile(urlSlugOrId);

        } else if (isCommunityItemRecord(record)) {
            switch (record.type) {
                case 'Review':
                    return routePaths.communityItem.review(urlSlugOrId);

                case 'Question':
                    return routePaths.communityItem.question(urlSlugOrId);

                case 'Howto':
                    return routePaths.communityItem.howto(urlSlugOrId);

                case 'Comparison':
                    return routePaths.communityItem.comparison(urlSlugOrId);

                default:
                    throw new Error('Unsupported community item type ' + record.type);
            }

        } else {

            throw new Error('Unsupported record type ' + (record as any).recordType);
        }
    }

    private async _getRecordToUrlSlugTuples(
        records: Array<TVanityRoutePathSupportedRecord>
        ): Promise<Array<TRecordUrlSlugTuple>> {

        if (!records.length) {
            return [];
        }

        let whereGroups = {};

        records.forEach(record => {
            const sluggableType = record.recordType;

            if (whereGroups.hasOwnProperty(sluggableType)) {
                whereGroups[sluggableType].push(record.id);
            } else {
                whereGroups[sluggableType] = [record.id];
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

        const find = promisify(this._UrlSlug.find, this._UrlSlug);

        const urlSlugs = await find({
            where: whereQuery
        });

        return records.map<TRecordUrlSlugTuple>(record => {
            const urlSlug = urlSlugs.find(urlSlug => (
                urlSlug.sluggableType === record.recordType
                && urlSlug.sluggableId === record.id
            ));

            return [record, urlSlug || null];
        });
    }
}
