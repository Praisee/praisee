import createSchema from 'pz-domain/src/graphql/schema-creator';
import graphql from 'pz-domain/src/graphql/graphql';

var proxyquire = require('proxyquire');

export default function startGraphQLServer(app: IApp) {
    // We need to use the same GraphQL as pz-domain due to an instanceof bug
    // See https://github.com/graphql/graphiql/issues/58#issuecomment-193468718
    var graphqlServer = proxyquire('express-graphql', {graphql: graphql});
    
    const Schema = createSchema(app.services.remoteApp);

    // Expose a GraphQL endpoint
    app.use('/i/graphql', graphqlServer({
        graphiql: true,
        pretty: true,
        schema: Schema,
    }));
}
