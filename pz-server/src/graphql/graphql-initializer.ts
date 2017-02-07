import createSchema from 'pz-server/src/graphql/schema-creator';
import {
    IAppRepositoryAuthorizers,
    IAppRepositories
} from 'pz-server/src/app/repositories';

var graphqlServer = require('express-graphql');
var maskErrors = require('graphql-errors').maskErrors;

module.exports = function startGraphQLServer(app: IApp) {
    const repositoryAuthorizers: IAppRepositoryAuthorizers = app.services.repositoryAuthorizers;
    const repositories: IAppRepositories = app.services.repositories;
    let Schema = createSchema(repositoryAuthorizers);

    maskErrors(Schema);

    // Expose a GraphQL endpoint
    app.use('/i/graphql', graphqlServer(async (request) => {
        const user = request.user && await repositories.users.findById(request.user.id);

        return {
            graphiql: true,
            pretty: true,
            schema: Schema,
            context: {
                request,
                hasSession: !!user,
                user: user,
                sessionAccessToken: request.user && request.user.accessToken ?
                    request.user.accessToken.id : null,
                responseErrors: []
            }
        }
    }));
};
