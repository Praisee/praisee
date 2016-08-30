import {IWorkerServer, IWorkerClient} from 'pz-server/src/support/worker';
import {IAppRepositories} from 'pz-server/src/app/repositories';

var getRankingsChannel = 'pz-server/src/rankings/topicCommunityItems/getRankings';
var getFeaturesChannel = 'pz-server/src/rankings/topicCommunityItems/getFeatures';
var calculateRankChannel = 'pz-server/src/rankings/topicCommunityItems/calculateRank';
var calculateFallbackRankChannel = 'pz-server/src/rankings/topicCommunityItems/calculateFallbackRank';

export async function getRankings(workerClient, topicId, cursor): Promise<any> {
}

export function registerWorkers(
        workerServer: IWorkerServer,
        workerClient: IWorkerClient,
        repositories: IAppRepositories
    ) {

    const workers = {
        getRankings: workerClient.getRequester<
            IGetRankingsRequest,
            IGetRankingsResponse
        >(getRankingsChannel),

        getFeatures: workerClient.getRequester<
            IGetFeaturesRequest,
            IGetFeaturesResponse
        >(getFeaturesChannel),

        calculateRank: workerClient.getRequester<
            ICalculateRankRequest,
            ICalculateRankResponse
        >(calculateRankChannel),

        calculateFallbackRank: workerClient.getRequester<
            ICalculateRankRequest,
            ICalculateRankResponse
        >(calculateFallbackRankChannel)
    };

    workerServer.registerWorker<IGetRankingsRequest, IGetRankingsResponse>(
        getRankingsChannel, (message) => (
            getRankingsWorker(message, repositories, workers)
        )
    );

    workerServer.registerWorker<IGetFeaturesRequest, IGetFeaturesResponse>(
        getFeaturesChannel, (message) => (
            getFeaturesWorker(message, repositories)
        )
    );

    workerServer.registerWorker<ICalculateRankRequest, ICalculateRankResponse>(
        calculateFallbackRankChannel, (message) => (
            calculateFallbackRankWorker(message)
        )
    );
}

export interface IGetRankingsRequest {
    topicId: number
}

export interface IGetRankingsResponse {
    rankings: {
        [communityItemId: number]: number
    }
}

async function getRankingsWorker({topicId}, repositories: IAppRepositories, workers) {
    const topicCommunityItemIds = await repositories.topics.findAllCommunityItemIds(topicId);

    const communityItemRankPromises = topicCommunityItemIds.map(async (communityItemId) => {
        const featuresResponse = await workers.getFeatures.send({communityItemId});

        let rankResponse;

        try {
            rankResponse = await workers.calculateRank.sendWithTimeout(
                featuresResponse, 25
            );

        } catch(error) {
            console.error(error);
            rankResponse = await workers.calculateFallbackRank.send(featuresResponse);
        }

        return [communityItemId, rankResponse.rank];
    });

    const communityItemRanks = await Promise.all<[number, number]>(communityItemRankPromises);

    const communityItemRanksMap = communityItemRanks.reduce((communityItemRanksMap, [id, rank]) => {
        communityItemRanksMap[id] = rank;
        return communityItemRanksMap;
    }, {});

    return {rankings: communityItemRanksMap};
}

export interface IGetFeaturesRequest {
    communityItemId: number
}

export interface IGetFeaturesResponse {
    featureMap: {
        [featureName: string]: any
    }
}

async function getFeaturesWorker({communityItemId}, repositories) {
    const featurePromises = Object.keys(features).map(async (featureName) => {
        return [featureName, await features[featureName]()];
    });

    const featureValues = await Promise.all<[string, any]>(featurePromises);

    const featureMap = featureValues.reduce((featureMap, [featureName, featureValue]) => {
        featureMap[featureName] = featureValue;
        return featureMap;
    }, {});

    return {featureMap};
}

export interface ICalculateRankRequest extends IGetFeaturesResponse {}

export interface ICalculateRankResponse {
    rank: number
}

async function calculateFallbackRankWorker({featureMap}) {
    const rank = Object.keys(featureMap).reduce((rank, featureName) => {
        return rank + featureMap[featureName];
    }, 0);

    return {rank}
}

const features = {
    itemUpvotes: async () => 1,
    itemDownvotes: async () => 0,
    itemReportedCount: async () => 0,
    itemAge: async () => 0,
    itemResponseOverallSentimentScore: async () => 0,
    itemResponseControversyScore: async () => 0,

    contentLength: async () => 0,
    contentFormattingRatio: async () => 0,
    contentMediaScore: async () => 0,
    contentMediaRelevancyScore: async () => 0,
    contentSpamScore: async () => 0,
    contentEmotionScore: async () => 0,
    contentHarassmentScore: async () => 0,
    contentObjectivityScore: async () => 0,

    authorActivityScore: async () => 0,
    authorUpvotes: async () => 1,
    authorDownvotes: async () => 0,
    authorProfileScore: async () => 0,
    authorReportedCount: async () => 0,
    authorAccountAge: async () => 0,
    authorContributionsAmount: async () => 0,
    authorContributionsFrequency: async () => 0,
    authorFollowersScore: async () => 0,

    authorSubjectExpertiseScore: async () => 0,
    authorBiasToSubjectScore: async () => 0,
    authorFollowersSubjectExpertiseScore: async () => 0,

    viewerFollowsAuthor: async () => 0,
    viewerUpvotesForAuthor: async () => 0,
    viewerDownvotesForAuthor: async () => 0,
    viewerUpvotesForAuthorRelativeToSubject: async () => 0,
    viewerDownvotesForAuthorRelativeToSubject: async () => 0,
    viewerNearestNeighborsScore: async () => 0,
    viewerOverallBiasRatio: async () => 1
};

