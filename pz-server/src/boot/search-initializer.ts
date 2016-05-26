import SearchClient from 'pz-server/src/search/search-client';
import SearchUpdater from 'pz-server/src/search/search-updater';

import searchSchema from 'pz-server/src/search/schema';

module.exports = function(app: IApp, next: ICallback) {
    app.domain.searchClient = new SearchClient;
    app.domain.searchUpdater = new SearchUpdater(app.models, app.domain.searchClient);
    app.domain.searchUpdater.start();
    
    // TODO: This is a temporary hack to drop all indexes (ala auto-migrate)
    // TODO: A future solution should use actual migrations or re-index the entire DB
    (Promise.resolve()
        .then(() => app.domain.searchClient.resetIndexFromSchema(searchSchema))
        .then(() => next(null))
        .catch((error) => next(error))
    );
};
