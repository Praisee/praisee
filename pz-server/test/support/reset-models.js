import promisify from 'pz-support/src/promisify';

export default async function resetModels(models) {
    await Promise.all(Object.keys(models).map(modelName => {
        const Model = models[modelName];

        if (!Model.destroyAll) {
            return;
        }
        
        return promisify(Model.destroyAll, Model)();
    }))
}
