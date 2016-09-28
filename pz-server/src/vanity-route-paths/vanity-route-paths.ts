import promisify from 'pz-support/src/promisify';

import routePaths from 'pz-server/src/vanity-route-paths/route-path-templates';

import {
    IRepositoryRecord, IRepository,
    createRecord
} from 'pz-server/src/support/repository';

import {IUrlSlugs, IUrlSlug} from 'pz-server/src/url-slugs/url-slugs';

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

type TRecordUrlSlugTuple = [TVanityRoutePathSupportedRecord, IUrlSlug];

export default class VanityRoutePaths implements IVanityRoutePaths {
    private _urlSlugs: IUrlSlugs;

    constructor(urlSlugs: IUrlSlugs) {
        this._urlSlugs = urlSlugs;
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

    private _resolveRoutePath(record: TVanityRoutePathSupportedRecord, urlSlug?: IUrlSlug): string {
        const urlSlugOrId = urlSlug ? urlSlug.fullSlug : record.id;
        if (isTopicRecord(record)) {
            return routePaths.topic(urlSlugOrId);

        } else if (isUserRecord(record)) {
            return routePaths.user.profile(urlSlugOrId);

        } else if (isCommunityItemRecord(record)) {
            return routePaths.communityItem(urlSlugOrId);

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

        const urlSlugsForEachRecord: Array<Array<IUrlSlug>> = await this._urlSlugs.findAllForEachSluggable(
            records.map(record => ({
                sluggableType: record.recordType,
                sluggableId: record.id
            }))
        );

        return urlSlugsForEachRecord.reduce<Array<TRecordUrlSlugTuple>>((recordUrlSlugTuples, urlSlugs, index) => {
            const record = records[index];

            if (!urlSlugs.length) {
                return [
                    ...recordUrlSlugTuples,
                    [record, null]
                ]
            }

            const newRecordUrlSlugTuples = urlSlugs.map<TRecordUrlSlugTuple>(urlSlug => [record, urlSlug]);

            return [
                ...recordUrlSlugTuples,
                ...newRecordUrlSlugTuples
            ];
        }, []);
    }
}
