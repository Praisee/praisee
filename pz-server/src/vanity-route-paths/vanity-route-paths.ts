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
    record.recordType === 'PraiseeUser'
    || record.recordType === 'OtherUser'
    || record.recordType === 'CurrentUser'
    || record.recordType === 'User'
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
    findByTopic(record: ITopic): Promise<ITopicVanityRoutePath>
}

export interface IVanityRoutePath extends IRepositoryRecord {
    recordType: 'VanityRoutePath'
    routePath: string
}

export interface ITopicVanityRoutePath extends IVanityRoutePath {
    routePath: string
    reviewsRoutePath: string
    questionsRoutePath: string
    guidesRoutePath: string
    comparisonsRoutePath: string
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

        const [, urlSlug] = recordToUrlSlugTuples[0];

        return this._resolveRoutePath(record, urlSlug);
    }

    async findByTopic(topic: ITopic): Promise<ITopicVanityRoutePath> {
        return await this.findByRecord(topic) as ITopicVanityRoutePath;
    }

    async findAllTuplesByRecords(records: Array<TVanityRoutePathSupportedRecord>): Promise<RecordRoutePathTuples> {
        const recordToUrlSlugTuples = await this._getRecordToUrlSlugTuples(records);

        return recordToUrlSlugTuples.map<RecordVanityRoutePathTuple>(([record, urlSlug]) => {
            return [record, this._resolveRoutePath(record, urlSlug)];
        });
    }

    private _resolveRoutePath(record: TVanityRoutePathSupportedRecord, urlSlug?: IUrlSlug): IVanityRoutePath {
        const urlSlugOrId = urlSlug ? urlSlug.fullSlug : record.id;

        if (isTopicRecord(record)) {
            const vanityRoutePath: ITopicVanityRoutePath = {
                recordType: 'VanityRoutePath',
                routePath: routePaths.topic.index(urlSlugOrId),
                reviewsRoutePath: routePaths.topic.reviews(urlSlugOrId),
                questionsRoutePath: routePaths.topic.questions(urlSlugOrId),
                guidesRoutePath: routePaths.topic.guides(urlSlugOrId),
                comparisonsRoutePath: routePaths.topic.comparisons(urlSlugOrId),
            };

            return vanityRoutePath;

        } else if (isUserRecord(record)) {
            const vanityRoutePath: IVanityRoutePath = {
                recordType: 'VanityRoutePath',
                routePath: routePaths.user.profile(urlSlugOrId)
            };

            return vanityRoutePath;

        } else if (isCommunityItemRecord(record)) {
            const vanityRoutePath: IVanityRoutePath = {
                recordType: 'VanityRoutePath',
                routePath: routePaths.communityItem(urlSlugOrId)
            };

            return vanityRoutePath;

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

        const urlSlugsForEachRecord: Array<Array<IUrlSlug>> = await this._urlSlugs.findAllNonAliasForEachSluggable(
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
