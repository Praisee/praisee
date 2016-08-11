import {
    IAppRepositories,
    IAppRepositoryAuthorizers
} from 'pz-server/src/app/repositories';

import Users from 'pz-server/src/users/users';
import UsersAuthorizer from 'pz-server/src/users/users-authorizer';

import Topics from 'pz-server/src/topics/topics';
import TopicsAuthorizer from 'pz-server/src/topics/topics-authorizer';

import CommunityItems from 'pz-server/src/community-items/community-items';
import CommunityItemsAuthorizer from 'pz-server/src/community-items/community-items-authorizer';

import convertContentDataToText from 'pz-server/src/content/data-to-text-converter';

module.exports = function initializeRepositories(app: IApp) {
    const users = new Users(app.models.User);
    const usersAuthorizer = new UsersAuthorizer(users);

    const topics = new Topics(app.models.Topic, app.models.UrlSlug);
    const topicsAuthorizer = new TopicsAuthorizer(topics);

    const communityItems = new CommunityItems(
        app.models.CommunityItem,
        convertContentDataToText
    );

    const communityItemsAuthorizer = new CommunityItemsAuthorizer(communityItems);

    const repositories: IAppRepositories = {
        users,
        topics,
        communityItems
    };

    const repositoryAuthorizers: IAppRepositoryAuthorizers = {
        users: usersAuthorizer,
        topics: topicsAuthorizer,
        communityItems: communityItemsAuthorizer
    };

    app.services.repositories = repositories;
    app.services.repositoryAuthorizers = repositoryAuthorizers;
};
