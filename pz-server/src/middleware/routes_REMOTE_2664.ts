import reactRouter from 'pz-server/src/site/site-route';

export default function routes(app: IApp) {
    
    reactRouter(app); //this should ALWAYS be the last - it handles get('*')
}
