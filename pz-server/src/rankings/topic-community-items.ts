import {IWorkerServer, IWorkerClient} from 'pz-server/src/support/worker';
import {IAppRepositories} from 'pz-server/src/app/repositories';

var rankAndCacheChannel = 'pz-server/src/rankings/topicCommunityItems/rankAndCache';
var rankAndCacheAsViewerChannel = 'pz-server/src/rankings/topicCommunityItems/rankAndCacheAsViewer';
var getFeaturesChannel = 'pz-server/src/rankings/topicCommunityItems/getFeatures';
var getViewerFeaturesChannel = 'pz-server/src/rankings/topicCommunityItems/getViewerFeatures';
var calculateRankFromFeaturesChannel = 'pz-server/src/rankings/topicCommunityItems/calculateRank';
var calculateFallbackRankFromFeaturesChannel = 'pz-server/src/rankings/topicCommunityItems/calculateFallbackRank';

export function registerWorkers(
        workerServer: IWorkerServer,
        workerClient: IWorkerClient,
        repositories: IAppRepositories
    ) {

    const workers = getWorkerRequesters(workerClient);

    workerServer.registerWorker<IRankAndCacheRequest, IRankAndCacheResponse>(
        rankAndCacheChannel, (message) => (
            rankAndCacheWorker(message, repositories, workers)
        )
    );

    workerServer.registerWorker<IRankAndCacheAsViewerRequest, IRankAndCacheAsViewerResponse>(
        rankAndCacheAsViewerChannel, (message) => (
            rankAndCacheWorker(message, repositories, workers)
        )
    );

    workerServer.registerWorker<IGetFeaturesRequest, IGetFeaturesResponse>(
        getFeaturesChannel, (message) => (
            getFeaturesWorker(message, repositories)
        )
    );

    workerServer.registerWorker<IGetFeaturesAsViewerRequest, IGetFeaturesAsViewerResponse>(
        getViewerFeaturesChannel, (message) => (
            getFeaturesWorker(message, repositories)
        )
    );

    workerServer.registerWorker<ICalculateRankFromFeaturesRequest, ICalculateRankFromFeaturesResponse>(
        calculateFallbackRankFromFeaturesChannel, (message) => (
            calculateFallbackRankFromFeaturesWorker(message)
        )
    );
}

export function getWorkerRequesters(workerClient: IWorkerClient) {
    return {
        rankAndCache: workerClient.getRequester<
            IRankAndCacheRequest,
            IRankAndCacheResponse
        >(rankAndCacheChannel),

        rankAndCacheAsViewer: workerClient.getRequester<
            IRankAndCacheAsViewerRequest,
            IRankAndCacheAsViewerResponse
        >(rankAndCacheAsViewerChannel),

        getFeatures: workerClient.getRequester<
            IGetFeaturesRequest,
            IGetFeaturesResponse
        >(getFeaturesChannel),

        getFeaturesAsViewer: workerClient.getRequester<
            IGetFeaturesAsViewerRequest,
            IGetFeaturesAsViewerResponse
        >(getFeaturesChannel),

        calculateRankFromFeatures: workerClient.getRequester<
            ICalculateRankFromFeaturesRequest,
            ICalculateRankFromFeaturesResponse
        >(calculateRankFromFeaturesChannel),

        calculateFallbackRankFromFeatures: workerClient.getRequester<
            ICalculateRankFromFeaturesRequest,
            ICalculateRankFromFeaturesResponse
        >(calculateFallbackRankFromFeaturesChannel)
    };
}

export interface IRankAndCacheRequest {
    topicId: number
}

export interface IRankAndCacheResponse {
    done: boolean
}

export interface IRankAndCacheAsViewerRequest {
    viewerId: number
    topicId: number
}

export interface IRankAndCacheAsViewerResponse extends IRankAndCacheResponse {}

function isViewerRequest(message): message is IRankAndCacheAsViewerRequest {
    return message.hasOwnProperty('viewerId') && message.viewerId;
}

async function rankAndCacheWorker(
        message: IRankAndCacheRequest | IRankAndCacheAsViewerRequest,
        repositories: IAppRepositories,
        workers
    ) {

    const {topicId} = message;
    const topicCommunityItemIds = await repositories.topics.findAllCommunityItemIds(topicId);
    const {getFeatures, getFeaturesAsViewer, calculateFallbackRankFromFeatures} = workers;

    let viewerId;
    if (isViewerRequest(message)) {
        viewerId = message.viewerId;
    }

    // TODO: This should be done in the Rankings repository and be based off the cursor instead
    let cacheExists = false;
    if (viewerId) {
        cacheExists = await repositories.rankingsCache.hasViewerTopicCommunityItemRanks(
            viewerId,
            topicId
        );
    } else {
        cacheExists = await repositories.rankingsCache.hasTopicCommunityItemRanks(
            topicId
        );
    }

    if (cacheExists) {
        return {done: true};
    }

    const communityItemRankPromises = topicCommunityItemIds.map(async (communityItemId) => {
        let featuresResponse;

        if (viewerId) {
            featuresResponse = await getFeaturesAsViewer.send({viewerId, topicId, communityItemId});
        } else {
            featuresResponse = await getFeatures.send({topicId, communityItemId});
        }

        const rankResponse = await calculateFallbackRankFromFeatures.send(featuresResponse);

        return [communityItemId, rankResponse.rank];
    });

    const communityItemRanks = await Promise.all<[number, number]>(communityItemRankPromises);

    if (viewerId) {
        await repositories.rankingsCache.setTopicCommunityItemRanksForViewer(
            viewerId, topicId, communityItemRanks
        );
    } else {
        await repositories.rankingsCache.setTopicCommunityItemRanks(
            topicId, communityItemRanks
        );
    }

    return {done: true};
}

export interface ITopicCommunityItemsFeatureMap extends
    IItemFeatureMap,
    IContentFeatureMap,
    IAuthorFeatureMap,
    IAuthorTopicFeatureMap
{}

export interface IViewerTopicCommunityItemsFeatureMap extends
    IItemFeatureMap,
    IContentFeatureMap,
    IAuthorFeatureMap,
    IViewerFeatureMap,
    IAuthorTopicFeatureMap
{}

export interface IGetFeaturesRequest {
    topicId: number,
    communityItemId: number
}

export interface IGetFeaturesResponse {
    featureMap: ITopicCommunityItemsFeatureMap
}

export interface IGetFeaturesAsViewerRequest {
    viewerId: number,
    topicId: number,
    communityItemId: number
}

export interface IGetFeaturesAsViewerResponse {
    featureMap: IViewerTopicCommunityItemsFeatureMap
}

async function getFeaturesWorker(message, repositories) {
    const {topicId, communityItemId} = message;

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

export interface ICalculateRankFromFeaturesRequest {
    featureMap: ITopicCommunityItemsFeatureMap | IViewerTopicCommunityItemsFeatureMap
}

export interface ICalculateRankFromFeaturesResponse {
    rank: number
}

async function calculateFallbackRankFromFeaturesWorker({featureMap}) {
    let rank = 0, weight, score;

    weight = 10;
    score = upVotesToViewsConfidenceScore(featureMap.itemViews, featureMap.itemUpVotes);
    rank += weight * score;

    weight = 0.01;
    score = freshnessScore(featureMap.itemAge);
    rank += weight * score;

    weight = 0.1;
    score = wordCountScore(featureMap.itemWordCount);
    rank += weight * score;

    weight = 0.5;
    score = authorContributionScore(
        featureMap.authorContributionsAmount,
        featureMap.authorUpVotes,
        featureMap.authorAccountAge
    );
    rank += weight * score;

    return {rank};
}

/**
 * Calculate the confidence interval for upvotes against the number of views.
 *
 * Shamelessly ripped from:
 * https://medium.com/hacking-and-gonzo/how-reddit-ranking-algorithms-work-ef111e33d0d9#.67unndydz
 */
function upVotesToViewsConfidenceScore(views, upvotes) {
    const total = views + upvotes;

    if (total < 1) {
        return 0;
    }

    const z = 1.281551565545;
    const p = upvotes / total;

    const left = p + 1/(2 * total) * z * z;
    const right = z * Math.sqrt(p * (1 - p) / total + z * z / (4 * total * total));
    const under = 1 + 1 / total * z * z;

    return (left - right) / under;
}

function wordCountScore(wordCount) {
    const sentenceLength = 5;
    const paragraphLength = sentenceLength * 4;
    const minimumHelpfulLength = paragraphLength * 2;
    const normalHelpfulLength = paragraphLength * 4;

    if (wordCount <= sentenceLength) {
        return -2;
    }

    if (wordCount <= paragraphLength) {
        return 0;
    }

    if (wordCount <= minimumHelpfulLength) {
        return 0.2;
    }

    if (wordCount <= normalHelpfulLength) {
        return 0.5;
    }

    return 1;
}

const oneHour = 3600;
const oneDay = oneHour * 24;

function authorContributionScore(authorContributionsAmount, authorUpVotes, authorAccountAge) {
    const upVotesPerContribution = authorUpVotes/(authorContributionsAmount + 1);
    const contributionsPerHour = authorContributionsAmount / (authorAccountAge / oneHour);

    const tooLittleData = authorAccountAge < oneDay && authorContributionsAmount < 3;
    const spammyAuthor = upVotesPerContribution < 0.5 && contributionsPerHour > 0.25;

    if (tooLittleData) {
        return 0; // Statistically irrelevant

    } else if (spammyAuthor) {
        return contributionsPerHour * -0.25 + Math.log(Math.min(upVotesPerContribution, 0.01));

    } else {

        return Math.log(Math.max(upVotesPerContribution, 0.01));
    }
}

/**
 * Based on the Poisson process from:
 * http://www.evanmiller.org/ranking-news-items-with-upvotes.html
 */
function freshnessScore(itemAge) {
    const updateRate = 24;
    const itemAgeInHours = itemAge / oneHour;

    return 1 / (1 - Math.pow(Math.E, (-1 * (1 / updateRate) * itemAgeInHours)));
}

/**
 * Item (community items, comments) features
 */
export interface IItemFeatureMap {
    itemViews: number
    itemUpVotes: number
    // itemDownvotes: number
    // itemReportedCount: number
    itemAge: number
    // itemResponseOverallSentimentScore: number
    // itemResponseControversyScore: number
    itemWordCount: number
}

/**
 * Content features
 */
export interface IContentFeatureMap {
    // contentFormattingRatio: number
    // contentMediaScore: number
    // contentMediaRelevancyScore: number
    // contentSpamScore: number
    // contentEmotionScore: number
    // contentHarassmentScore: number
    // contentObjectivityScore: number
}

/**
 * Author features
 */
export interface IAuthorFeatureMap {
    // authorActivityScore: number
    authorUpVotes: number
    // authorDownvotes: number
    // authorProfileScore: number
    // authorReportedCount: number
    authorAccountAge: number
    authorContributionsAmount: number
    // authorFollowersScore: number
}

/**
 * Viewer (viewing user) features
 */
export interface IViewerFeatureMap {
    // viewerFollowsAuthor: number
    // viewerUpVotesForAuthor: number
    // viewerViewsForAuthor: number
    // viewerDownvotesForAuthor: number
    // viewerUpVotesForAuthorRelativeToTopic: number
    // viewerDownvotesForAuthorRelativeToTopic: number
    // viewerNearestNeighborsScore: number
    // viewerOverallBiasRatio: number
}

/**
 * Author-topic features
 */
export interface IAuthorTopicFeatureMap {
    // authorTopicExpertiseScore: number
    // authorBiasToTopicScore: number
    // authorFollowersTopicExpertiseScore: number
}

const randomNumber = (minimum, maximum) => Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;

const features = {
    /*
     * Item features
     */

    itemViews: async (repositories: IAppRepositories, itemType, itemId) => {
        // return await repositories.trackedEvents.getCountForTypeWithMatchingData(
        //     'ItemViewEvent',
        //     {itemType, itemId}
        // );
        return randomNumber(0, 100);
    },

    itemUpVotes: async () => randomNumber(0, 100),

    // itemDownvotes: async () => 0,
    // itemReportedCount: async () => 0,
    itemAge: async () => randomNumber(0, 4398),
    // itemResponseOverallSentimentScore: async () => 0,
    // itemResponseControversyScore: async () => 0,
    itemWordCount: async () => randomNumber(0, 235),

    /*
     * Content features
     */

    // contentFormattingRatio: async () => 0,
    // contentMediaScore: async () => 0,
    // contentMediaRelevancyScore: async () => 0,
    // contentSpamScore: async () => 0,
    // contentEmotionScore: async () => 0,
    // contentHarassmentScore: async () => 0,
    // contentObjectivityScore: async () => 0,

    /*
     * Author features
     */

    // authorActivityScore: async () => 0,
    authorUpVotes: async () => randomNumber(0, 234),
    // authorDownvotes: async () => 0,
    // authorProfileScore: async () => 0,
    // authorReportedCount: async () => 0,
    authorAccountAge: async () => randomNumber(0, 392489),
    authorContributionsAmount: async () => randomNumber(0, 30),
    // authorFollowersScore: async () => 0,

    /*
     * Viewer (viewing user) features
     */

    // viewerFollowsAuthor: async () => 0,
    // viewerUpVotesForAuthor: async () => 0,
    // viewerViewsForAuthor: async () => 0,
    // viewerDownvotesForAuthor: async () => 0,
    // viewerUpVotesForAuthorRelativeToTopic: async () => 0,
    // viewerDownvotesForAuthorRelativeToTopic: async () => 0,
    // viewerNearestNeighborsScore: async () => 0,
    // viewerOverallBiasRatio: async () => 1

    /*
     * Author-topic features
     */

    // authorTopicExpertiseScore: async () => 0,
    // authorBiasToTopicScore: async () => 0,
    // authorFollowersTopicExpertiseScore: async () => 0,
};
