import {
    IRankingsCache,
    TTopicCommunityItemRank,
    TTopicCommunityItemRanks,
    CacheMissError
} from 'pz-server/src/rankings/rankings-cache';

import {
    TBiCursor,
    ICursorResults,
    toNumberCursor,
    fromNumberCursor
} from 'pz-server/src/support/cursors/cursors';

import {applyCursorToSearch} from 'pz-server/src/support/cursors/search-helpers';

export type TRankingTuple = [number, number];
export type TRankingTuples = Array<TRankingTuple>;

export default class RedisRankingsCache implements IRankingsCache {
    private _connection: IORedis.Redis;

    constructor(cacheConnection: IORedis.Redis) {
        this._connection = cacheConnection;
    }

    async findSomeTopicCommunityItemRanks(
            topicId: number,
            cursor: TBiCursor
        ): Promise<ICursorResults<TTopicCommunityItemRank> | CacheMissError> {


        if (!this.hasTopicCommunityItemRanks(topicId)) {
            return new CacheMissError();
        }

        const key = this._generateTopicCommunityItemRanksKey(topicId);
        const results = this._findSomeRankings<TTopicCommunityItemRank>(key, cursor);

        return results;
    }

    async findSomeViewerTopicCommunityItemRanks(
            viewerId: number,
            topicId: number,
            cursor: TBiCursor
        ): Promise<ICursorResults<TTopicCommunityItemRank> | CacheMissError> {

        if (!this.hasViewerTopicCommunityItemRanks(viewerId, topicId)) {
            return new CacheMissError();
        }

        const key = this._generateViewerTopicCommunityItemRanksKey(viewerId, topicId);
        const results = this._findSomeRankings<TTopicCommunityItemRank>(key, cursor);

        return results;
    }

    async hasTopicCommunityItemRanks(topicId: number): Promise<boolean> {
        return await this._keyExists(this._generateTopicCommunityItemRanksKey(
            topicId
        ));
    }

    async hasViewerTopicCommunityItemRanks(viewerId: number, topicId: number): Promise<boolean> {
        return await this._keyExists(this._generateViewerTopicCommunityItemRanksKey(
            viewerId,
            topicId
        ));
    }

    async setTopicCommunityItemRanks(topicId: number, rankings: TTopicCommunityItemRanks): Promise<void> {
        if (!rankings.length) {
            return;
        }

        await this._connection.zadd(
            this._generateTopicCommunityItemRanksKey(topicId),
            ...rankings.map(([communityItemId, rank]) => [rank, communityItemId])
        );
    }

    async appendTopicCommunityItemRank(topicId: number, ranking: TTopicCommunityItemRank): Promise<void> {
        throw new Error('Not implemented yet');
    }

    async setTopicCommunityItemRanksForViewer(
            viewerId: number,
            topicId: number,
            rankings: TTopicCommunityItemRanks
        ): Promise<void> {

        if (!rankings.length) {
            return;
        }

        await this._connection.zadd(
            this._generateViewerTopicCommunityItemRanksKey(viewerId, topicId),
            ...rankings.map(([communityItemId, rank]) => [rank, communityItemId])
        );
    }

    async appendTopicCommunityItemRankForViewer(
            viewerId: number,
            topicId: number,
            ranking: TTopicCommunityItemRank
        ): Promise<void> {

        throw new Error('Not implemented yet');
    }

    private _generateTopicCommunityItemRanksKey(topicId) {
        return `viewerTopicCommunityItemRanks(topic:${topicId})`;
    }

    private _generateViewerTopicCommunityItemRanksKey(viewerId, topicId) {
        return `viewerTopicCommunityItemRanks(viewer:${viewerId},topic:${topicId})`;
    }

    private async _keyExists(key) {
        const result = await this._connection.exists(key);
        const oneOrZero = Number(result);
        return !!oneOrZero;
    }

    private _orderedSetResultsToRankingTuples(orderedSet): TRankingTuples {
        if (orderedSet.length % 2) {
            throw new Error('Result set could not be partitioned into tuples');
        }

        let tuples = [];

        for (let i = 0; i < orderedSet.length; i = i + 2) {
            const rank = orderedSet[i + 1];
            const id = orderedSet[i];

            tuples.push([id, rank]);
        }

        return tuples;
    };

    private async _findSomeRankings<T extends TRankingTuple>(
            key: string,
            cursor: TBiCursor
        ): Promise<ICursorResults<T>> {

        return await applyCursorToSearch<any, T>({
            cursor,

            search: {isAscending: false, limit: 10},

            searchFields: ['score'],

            getCursorFromSearchResult: ([id, rank]) => {
                // TODO: This should record a unique cache ID as well so that the
                // TODO: cache isn't pulled out from under the user
                return toNumberCursor(Number(rank));
            },

            getSearchFieldValueFromCursor: (cursor) => {
                return fromNumberCursor(cursor);
            },

            isAscendingSort: (search) => search.isAscending,

            updateSearchFilter: (search, searchField, toGreaterThan, cursorValue) => {
                return Object.assign({}, search, {
                    filter: {on: cursorValue, isGreaterThan: toGreaterThan}
                });
            },

            updateSearchOrder: (search, searchField, toAscending) => {
                return Object.assign({}, search, {
                    isAscending: toAscending
                });
            },

            updateSearchLimit: (search, toLimit) => {
                return Object.assign({}, search, {
                    limit: toLimit
                });
            },

            performSearch: async (search) => {
                const getOrderedSet = async (key, limit, isAscending, greaterThan = null, lessThan = null) => {
                    const bottomRankedFirst = 'zrangebyscore';
                    const topRankedFirst = 'zrevrangebyscore';

                    let command, commandArgs;

                    if (isAscending) {
                        command = bottomRankedFirst;

                        commandArgs = [
                            key,
                            greaterThan ? '(' + greaterThan : '-inf',
                            lessThan ? lessThan + ')' : '+inf',
                            'withscores',
                            'limit',
                            '0',
                            limit
                        ];

                    } else {

                        command = topRankedFirst;

                        commandArgs = [
                            key,
                            lessThan ? '(' + lessThan : '+inf',
                            greaterThan ? greaterThan + ')' : '-inf',
                            'withscores',
                            'limit',
                            '0',
                            limit
                        ];
                    }

                    return await this._connection[command](...commandArgs);
                };

                if (!search.filter) {
                    const results = await getOrderedSet(
                        key,
                        search.limit,
                        search.isAscending
                    );

                    return this._orderedSetResultsToRankingTuples(results);

                } else {

                    let greaterThan = null, lessThan = null;

                    if (search.filter.isGreaterThan) {
                        greaterThan = search.filter.on;
                    } else {
                        lessThan = search.filter.on;
                    }

                    const results = await getOrderedSet(
                        key,
                        search.limit,
                        search.isAscending,
                        greaterThan,
                        lessThan
                    );

                    return this._orderedSetResultsToRankingTuples(results);
                }
            }
        });
    }
}
