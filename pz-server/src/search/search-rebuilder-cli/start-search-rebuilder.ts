import SearchClient from 'pz-server/src/search/search-client';
import SearchUpdater from 'pz-server/src/search/search-updater';

module.exports = function initializeWorkers(app: IApp, next: ICallback) {
    console.log('Starting search rebuilder');

    const searchClient = new SearchClient();
    const searchUpdater = new SearchUpdater(app.models, searchClient);

    app.services.searchClient = searchClient;
    app.services.searchUpdater = searchUpdater;

    searchUpdater.rebuildSearch()
        .then(() => {
            console.log('Finished rebuilding search');
            next(null);
        })
        .catch(error => next(error));
};
