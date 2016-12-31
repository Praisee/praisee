import modelConfig from 'pz-server/src/app/model-config';
import pzPath from 'pz-support/src/pz-path';

export default {
    appRootDir: pzPath('pz-server', 'src/app'),
    models: modelConfig,

    bootScripts: [
        pzPath('pz-server', 'src/cache/initialize-cache'),
        pzPath('pz-server', 'src/app/initialize-worker-client'),
        pzPath('pz-server', 'src/app/repository-initializer'), 
        // Due to model changes in authentication-initializer we need to initialize before auto-updating models
        pzPath('pz-server', 'src/authentication/authentication-initializer'),
        pzPath('pz-server', 'src/app/auto-update-models'),

        // Search initializer needs to come before any DB inserts/updates/deletes
        pzPath('pz-server', 'src/search/search-initializer'),

        pzPath('pz-server', 'src/app/dev-env-seeder'),
        pzPath('pz-server', 'src/users/sign-up-route'),
        pzPath('pz-server', 'src/graphql/graphql-initializer'),
        pzPath('pz-server', 'src/site/template-renderer'),
        pzPath('pz-server', 'src/search/suggestion-routes'),
        pzPath('pz-server', 'src/photos/upload-routes'),
        pzPath('pz-server', 'src/site/health-check-routes'),
        pzPath('pz-server', 'src/site/site-route'),
        pzPath('pz-server', 'src/site/static-assets')
    ]
};
