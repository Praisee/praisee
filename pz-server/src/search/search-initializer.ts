import SearchClient from 'pz-server/src/search/search-client';
import SearchUpdater from 'pz-server/src/search/search-updater';

import searchSchema from 'pz-server/src/search/schema';

module.exports = function(app: IApp, next: ICallback) {
    app.services.searchClient = new SearchClient;
    app.services.searchUpdater = new SearchUpdater(app.models, app.services.searchClient);
    app.services.searchUpdater.start();
    
    // TODO: This is a temporary hack to drop all indexes (ala auto-migrate)
    // TODO: A future solution should use actual migrations or re-index the entire DB
    (Promise.resolve()
        .then(() => app.services.searchClient.resetIndexFromSchema(searchSchema))
        .then(() => next(null))
        .catch((error) => next(error))
    );
};
