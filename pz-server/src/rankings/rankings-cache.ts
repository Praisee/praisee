import { IRepository, IRepositoryRecord } from 'pz-server/src/support/repository';

import {
    ICursorResults, TBiCursor
} from 'pz-server/src/support/cursors/cursors';

import ExtendableError from 'pz-server/src/support/extendable-error';

export type TCommunityItemId = number;
export type TRank = number;

export type TTopicCommunityItemRank = [TCommunityItemId, TRank];
export type TTopicCommunityItemRanks = Array<TTopicCommunityItemRank>;

export class CacheMissError extends ExtendableError {
    constructor(message = 'Could not find item in cache') { super(message); }
}

export function isCacheMissError(result: any): result is CacheMissError {
    return result instanceof CacheMissError;
}

export interface IRankingsCache extends IRepository {
    findSomeTopicCommunityItemRanks(topicId: number, cursor: TBiCursor): Promise<
        ICursorResults<TTopicCommunityItemRank> | CacheMissError
    >

    findSomeViewerTopicCommunityItemRanks(viewerId: number, topicId: number, cursor: TBiCursor): Promise<
        ICursorResults<TTopicCommunityItemRank> | CacheMissError
    >

    hasTopicCommunityItemRanks(topicId: number): Promise<boolean>

    hasViewerTopicCommunityItemRanks(viewerId: number, topicId: number): Promise<boolean>

    setTopicCommunityItemRanks(topicId: number, rankings: TTopicCommunityItemRanks): Promise<void>

    appendTopicCommunityItemRank(topicId: number, ranking: TTopicCommunityItemRank): Promise<void>

    setTopicCommunityItemRanksForViewer(
        viewerId: number,
        topicId: number,
        rankings: TTopicCommunityItemRanks
    ): Promise<void>

    appendTopicCommunityItemRankForViewer(
        viewerId: number,
        topicId: number,
        ranking: TTopicCommunityItemRank
    ): Promise<void>
}
