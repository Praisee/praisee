import models from 'pz-server/src/model-config';
import importJson from 'pz-support/src/import-json';
import seedDevEnv from 'pz-server/src/dev-env-seeder';
import promisify from 'pz-support/src/promisify';

var datasources = importJson('pz-server/src/datasources.json');

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
    
    if (process.env === 'production') {
        
        autoUpdate('autoupdate').then(() => next(null)).catch(next);
        
    } else {
        
        (autoUpdate('automigrate')
            .then(() => {
                return seedDevEnv(app);
            })
            .then(() => next(null))
            .catch(next)
        );
        
    }

};
