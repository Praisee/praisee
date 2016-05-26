import homeRoute from 'pz-server/src/home/home-route';
import searchRoute from 'pz-server/src/search/site-search/search-route';

export default function routes(app: IApp) {
    homeRoute(app);
    searchRoute(app);
}
