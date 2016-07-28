import {
    IAppRepositories,
    IAppRepositoryAuthorizers
} from 'pz-server/src/app/repositories';

import Users from 'pz-server/src/users/users';
import UsersAuthorizer from 'pz-server/src/users/users-authorizer';

import Topics from 'pz-server/src/topics/topics';
import TopicsAuthorizer from 'pz-server/src/topics/topics-authorizer';

module.exports = function initializeRepositories(app: IApp) {
    const users = new Users(app.models.User);
    const usersAuthorizer = new UsersAuthorizer(users);

    const topics = new Topics(app.models.Topic, app.models.UrlSlug);
    const topicsAuthorizer = new TopicsAuthorizer(topics);

    const repositories: IAppRepositories = {
        users,
        topics
    };

    const repositoryAuthorizers: IAppRepositoryAuthorizers = {
        users: usersAuthorizer,
        topics: topicsAuthorizer
    };

    app.services.repositories = repositories;
    app.services.repositoryAuthorizers = repositoryAuthorizers;
};
