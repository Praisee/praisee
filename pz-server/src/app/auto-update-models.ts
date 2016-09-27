import models from 'pz-server/src/app/model-config';
import importJson from 'pz-support/src/import-json';
import promisify from 'pz-support/src/promisify';
import serverInfo from 'pz-server/src/app/server-info';

var datasources = importJson('pz-server/src/app/datasources.json');

// Source: http://stackoverflow.com/a/31119634/786810

module.exports = function(app: IApp, next: ICallback) {

    function autoUpdate(action: 'autoupdate' | 'automigrate' = 'autoupdate') {
        return Promise.all(Object.keys(models).map(function(key) {
            if (!models[key].dataSource || !datasources[models[key].dataSource]) {
                return;
            }

            const modelDataSource = app.dataSources[models[key].dataSource];

            return (promisify(modelDataSource[action], modelDataSource)(key)
                .then(() => {
                    const actionLabel = action === 'autoupdate' ? 'updated' : 'migrated';
                    console.log(`Model ${key} ${actionLabel}`);
                })
                .catch(error => {
                    console.error(error);
                    throw error;
                })
            );
        }));
    }

    if (serverInfo.isProductionEnv()) {
        autoUpdate('autoupdate').then(() => next(null)).catch(next);
    } else {
        autoUpdate('automigrate').then(() => next(null)).catch(next);
    }

};
