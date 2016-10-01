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

export async function loopbackFindAllForEach
    <TModel extends IPersistedModel, TModelInstance extends IPersistedModelInstance>(
        Model: TModel, fields: Array<string>, fieldValues: Array<Array<any>>
    ): Promise<Array<TModelInstance>> {

    if (!fieldValues.length) {
        return [];
    }

    if (!fields.length) {
        throw new Error('Fields must be an array of queryable fields with at least one field')
    }

    const find = promisify(Model.find, Model);

    let whereConditions = fieldValues.map((fieldValueSet) => {
        if (fieldValueSet.length !== fields.length) {
            throw new Error(`Mismatch of fields length and field values length:`
            + `${JSON.stringify(fields)} vs ${JSON.stringify(fieldValueSet)}`);
        }

        return fields.reduce((conditions, field, index) => {
            conditions[field] = fieldValueSet[index];
            return conditions;
        }, {});

    });

    const models = await find({
        where: whereConditions.length > 1 ? {or: whereConditions} : whereConditions[0]
    });

    return fieldValues.map<TModelInstance>((fieldValueSet) => {
        const foundModel = models.find(model =>
            fields.every((field, index) => model[field] === fieldValueSet[index])
        );

        return foundModel;
    });
}
