import graphQLHTTP from 'express-graphql';
import createSchema from 'pz-server/src/graphql/schema-creator';

export default function startGraphQLServer(app: IApp) {
    // Expose a GraphQL endpoint
    const Schema = createSchema(app);
    
    app.use('/i/graphql', graphQLHTTP({
        graphiql: true,
        pretty: true,
        schema: Schema,
    }));
}
