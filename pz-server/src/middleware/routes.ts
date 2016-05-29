import searchRoute from 'pz-server/src/search/site-search/search-route';
import reactRouter from 'pz-server/src/site/site-route';

export default function routes(app: IApp) {
    searchRoute(app);
    reactRouter(app); //this should ALWAYS be the last - it handles get('*')
}
