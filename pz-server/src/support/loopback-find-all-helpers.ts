import promisify from 'pz-support/src/promisify';

export async function loopbackFindAllByIds
    <TModel extends IPersistedModel, TModelInstance extends IPersistedModelInstance>(
        Model: TModel, ids: Array<any>
    ): Promise<Array<TModelInstance>> {

    if (!ids.length) {
        return [];
    }

    const find = promisify(Model.find, Model);

    const models: Array<TModelInstance> = await find({
        where: { id: { inq: ids } }
    });

    const modelsMap = models.reduce<Map<any, TModelInstance>>((modelsMap, model) => {
        modelsMap.set(model.id, model);
        return modelsMap;
    }, new Map());

    return ids.map(id => modelsMap.get(id));
}
