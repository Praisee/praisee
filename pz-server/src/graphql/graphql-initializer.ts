import createSchema from 'pz-server/src/graphql/schema-creator';

var graphqlServer = require('express-graphql');
var maskErrors = require('graphql-errors').maskErrors;

module.exports = function startGraphQLServer(app: IApp) {
    let Schema = createSchema(app.services.repositoryAuthorizers);

    maskErrors(Schema);

    // Expose a GraphQL endpoint
    app.use('/i/graphql', graphqlServer(request => ({
        graphiql: true,
        pretty: true,
        schema: Schema,
        context: {
            request,
            hasSession: !!request.user,
            user: request.user,
            sessionAccessToken: request.user && request.user.accessToken ?
                request.user.accessToken.id : null,
            responseErrors: []
        }
    })));
};
