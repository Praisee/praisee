import {
    IAppRepositories,
    IAppRepositoryAuthorizers
} from 'pz-server/src/app/repositories';

import Users from 'pz-server/src/users/users';
import UsersAuthorizer from 'pz-server/src/users/users-authorizer';

import Topics from 'pz-server/src/topics/topics';
import TopicsAuthorizer from 'pz-server/src/topics/topics-authorizer';

import CommunityItems from 'pz-server/src/community-items/loopback-community-items';
import CommunityItemsAuthorizer from 'pz-server/src/community-items/community-items-authorizer';

import Comments from 'pz-server/src/comments/loopback-comments';
import CommentsAuthorizer from 'pz-server/src/comments/comments-authorizer';

import ContentFilterer from 'pz-server/src/content/content-filterer';
import convertContentDataToText from 'pz-server/src/content/data-to-text-converter';
import FilteredCommunityItems from 'pz-server/src/community-items/filtered-community-items';
import VanityRoutePaths from 'pz-server/src/vanity-route-paths/vanity-route-paths';

module.exports = function initializeRepositories(app: IApp) {
    const routePaths = new VanityRoutePaths(app.models.UrlSlug);

    const users = new Users(app.models.User);
    const usersAuthorizer = new UsersAuthorizer(users);

    const topics = new Topics(app.models.Topic, app.models.UrlSlug);
    const topicsAuthorizer = new TopicsAuthorizer(topics);

    const communityItems = new CommunityItems(
        app.models.CommunityItem
    );

    const contentFilterer = new ContentFilterer(routePaths, topics, communityItems);

    const filteredCommunityItems = new FilteredCommunityItems(
        communityItems,
        contentFilterer,
        convertContentDataToText
    );

    const communityItemsAuthorizer = new CommunityItemsAuthorizer(filteredCommunityItems);

    const comments = new Comments(app.models.Comment);
    const commentsAuthorizer = new CommentsAuthorizer(comments);

    const repositories: IAppRepositories = {
        users,
        topics,
        communityItems: filteredCommunityItems,
        comments
    };

    const repositoryAuthorizers: IAppRepositoryAuthorizers = {
        users: usersAuthorizer,
        topics: topicsAuthorizer,
        communityItems: communityItemsAuthorizer,
        comments: commentsAuthorizer
    };

    app.services.repositories = repositories;
    app.services.repositoryAuthorizers = repositoryAuthorizers;
};
