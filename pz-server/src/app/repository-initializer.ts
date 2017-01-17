import {
    IAppRepositories,
    IAppRepositoryAuthorizers
} from 'pz-server/src/app/repositories';

import {ITrackedEvents} from 'pz-server/src/tracked-events/tracked-events'; // TODO: Finish for rankings

import Users from 'pz-server/src/users/loopback-users';
import UsersLoader from '../users/users-loader';
import UsersAuthorizer from 'pz-server/src/users/users-authorizer';

import Topics from 'pz-server/src/topics/loopback-topics';
import TopicsLoader from '../topics/topics-loader';
import FilteredTopics from 'pz-server/src/topics/filtered-topics';
import TopicsAuthorizer from 'pz-server/src/topics/topics-authorizer';

import TopicAttributes from 'pz-server/src/topics/topic-attributes/loopback-topic-attributes';
import TopicAttributesAuthorizer from 'pz-server/src/topics/topic-attributes/topic-attributes-authorizer';

import CommunityItems from 'pz-server/src/community-items/loopback-community-items';
import CommunityItemsLoader from 'pz-server/src/community-items/community-items-loader';
import CommunityItemsAuthorizer from 'pz-server/src/community-items/community-items-authorizer';

import Reviews from 'pz-server/src/community-items/reviews/loopback-reviews';
import ReviewsAuthorizer from 'pz-server/src/community-items/reviews/reviews-authorizer';
import FilteredReviews from 'pz-server/src/community-items/reviews/filtered-reviews';

import Comments from 'pz-server/src/comments/loopback-comments';
import CommentsAuthorizer from 'pz-server/src/comments/comments-authorizer';
import FilteredComments from 'pz-server/src/comments/filtered-comments';

import Votes from 'pz-server/src/votes/loopback-votes';
import VotesLoader from 'pz-server/src/votes/votes-loader';
import VotesAuthorizer from 'pz-server/src/votes/votes-authorizer';

import ContentFilterer from 'pz-server/src/content/content-filterer';
import convertContentDataToText from 'pz-server/src/content/data-to-text-converter';
import FilteredCommunityItems from 'pz-server/src/community-items/filtered-community-items';

import UrlSlugs from 'pz-server/src/url-slugs/loopback-url-slugs';
import UrlSlugsLoader from 'pz-server/src/url-slugs/url-slugs-loader';

import VanityRoutePaths from 'pz-server/src/vanity-route-paths/vanity-route-paths';
import VanityRoutePathsAuthorizer from 'pz-server/src/vanity-route-paths/vanity-route-paths-authorizer';

import {IConnectionManager} from 'pz-server/src/cache/connection-manager';
import RankingsCache from 'pz-server/src/rankings/redis-rankings-cache';
import Rankings from 'pz-server/src/rankings/rankings';

import Photos from 'pz-server/src/photos/loopback-photos';
import PhotosEvents from 'pz-server/src/photos/photos-events';
import PhotosLoader from 'pz-server/src/photos/photos-loader';
import PhotosAuthorizer from 'pz-server/src/photos/photos-authorizer';

module.exports = function initializeRepositories(app: IApp) {
    const cacheConnections: IConnectionManager = app.services.cacheConnections;

    const rankingsCache = new RankingsCache(cacheConnections.getConnection('rankings'));
    const rankings = new Rankings(rankingsCache, app.services.workerClient);

    const urlSlugs = new UrlSlugsLoader(new UrlSlugs(app.models.UrlSlug));

    const vanityRoutePaths = new VanityRoutePaths(urlSlugs);
    const vanityRoutePathsAuthorizer = new VanityRoutePathsAuthorizer(vanityRoutePaths);

    const users = new UsersLoader(new Users(app.models.PraiseeUser, app.models.UrlSlug));
    const usersAuthorizer = new UsersAuthorizer(users);

    const photosEvents = new PhotosEvents(new Photos(app.models.Photo, app.models.DeletedPhoto));
    const photos = new PhotosLoader(photosEvents);
    const photosAuthorizer = new PhotosAuthorizer(photos);

    const topics = new TopicsLoader(new Topics(
        app.models.Topic,
        app.models.CommunityItem,
        app.models.UrlSlug,
        app.models.Photo,
        rankings,
        photosEvents
    ));

    const topicAttributes = new TopicAttributes(app.models.TopicAttribute);
    const topicAttributesAuthorizer = new TopicAttributesAuthorizer(topicAttributes);

    const votes = new VotesLoader(new Votes(app.models.Vote));
    const votesAuthorizer = new VotesAuthorizer(votes);

    const communityItems = new CommunityItemsLoader(new CommunityItems(
        app.models.CommunityItem,
        app.models.CommunityItemInteraction,
        app.models.UrlSlug,
        app.models.Photo
    ));

    const contentFilterer = new ContentFilterer(
        vanityRoutePaths, topics, communityItems, photos
    );

    const filteredTopics = new FilteredTopics(
        topics,
        contentFilterer
    );

    const topicsAuthorizer = new TopicsAuthorizer(filteredTopics);

    const filteredCommunityItems = new FilteredCommunityItems(
        communityItems,
        photos,
        contentFilterer,
        convertContentDataToText
    );

    const communityItemsAuthorizer = new CommunityItemsAuthorizer(filteredCommunityItems);

    const reviews = new FilteredReviews(new Reviews(app.models.CommunityItem, topics));
    const reviewsAuthorizer = new ReviewsAuthorizer(reviews, filteredCommunityItems);

    const comments = new Comments(app.models.Comment);
    const filteredComments = new FilteredComments(
        comments,
        contentFilterer,
        convertContentDataToText
    );

    const commentsAuthorizer = new CommentsAuthorizer(filteredComments);

    const repositories: IAppRepositories = {
        users,
        topics,
        topicAttributes,
        communityItems: filteredCommunityItems,
        reviews,
        comments: filteredComments,
        votes,
        urlSlugs,
        vanityRoutePaths,
        trackedEvents: {} as ITrackedEvents, // Finish for rankings
        rankingsCache,
        rankings,
        photos
    };

    const repositoryAuthorizers: IAppRepositoryAuthorizers = {
        users: usersAuthorizer,
        topics: topicsAuthorizer,
        communityItems: communityItemsAuthorizer,
        reviews: reviewsAuthorizer,
        comments: commentsAuthorizer,
        votes: votesAuthorizer,
        vanityRoutePaths: vanityRoutePathsAuthorizer,
        topicAttributes: topicAttributesAuthorizer,
        photos: photosAuthorizer
    };

    app.services.repositories = repositories;
    app.services.repositoryAuthorizers = repositoryAuthorizers;
};
