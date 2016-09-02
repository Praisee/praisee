import {IWorkerClient} from 'pz-server/src/support/worker';

import {TBiCursor, ICursorResults} from 'pz-server/src/support/cursors/cursors';

import {
    IRankingsCache,
    isCacheMissError
} from 'pz-server/src/rankings/rankings-cache';

import ExtendableError from 'pz-server/src/support/extendable-error';

import {getWorkerRequesters as getTopicCommunityItemWorkers} from 'pz-server/src/rankings/topic-community-items';
import {TOptionalUser} from 'pz-server/src/users/users';

export type ITopicCommunityItemIdRankTuple = [number, number];

export class RankingsUnavailableError extends ExtendableError {
    constructor(message = 'Rankings could not be provided') { super(message); }
}

export interface IRankings {
    findSomeTopicCommunityItemIdsAndRanks(
        topicId: number,
        asUser: TOptionalUser,
        cursor: TBiCursor
    ): Promise<ICursorResults<ITopicCommunityItemIdRankTuple> | RankingsUnavailableError>
}

export default class Rankings implements IRankings {
    private _rankingsCache: IRankingsCache;
    private _workerClient: IWorkerClient;

    constructor(rankingsCache, workerClient) {
        this._rankingsCache = rankingsCache;
        this._workerClient = workerClient;
    }

    async findSomeTopicCommunityItemIdsAndRanks(
            topicId: number,
            asUser: TOptionalUser,
            cursor: TBiCursor
        ): Promise<ICursorResults<ITopicCommunityItemIdRankTuple> | RankingsUnavailableError> {

        try {
            await this._rankTopicCommunityItem(topicId, asUser);

        } catch(error) {
            return new RankingsUnavailableError();
        }

        const rankings = await this._findSomeTopicCommunityItemRanks(topicId, asUser, cursor);

        if (isCacheMissError(rankings)) {
            return new RankingsUnavailableError();
        } else {
            return rankings;
        }
    }

    private async _rankTopicCommunityItem(topicId, asUser) {
        const {rankAndCache, rankAndCacheAsViewer} = getTopicCommunityItemWorkers(this._workerClient);

        if (asUser) {
            await rankAndCacheAsViewer.sendWithTimeout(
                {viewerId: asUser.id, topicId}, 300
            );
        } else {
            await rankAndCache.sendWithTimeout(
                {topicId}, 300
            );
        }
    }

    private async _findSomeTopicCommunityItemRanks(topicId, asUser, cursor) {
        if (asUser) {
            return await this._rankingsCache.findSomeViewerTopicCommunityItemRanks(
                asUser.id,
                topicId,
                cursor
            );
        } else {
            return await this._rankingsCache.findSomeTopicCommunityItemRanks(
                topicId,
                cursor
            );
        }
    }
}
