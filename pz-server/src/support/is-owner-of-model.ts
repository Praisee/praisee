import promisify from 'pz-support/src/promisify';

export default async function isOwnerOfModel(
    userId: number, Model: IPersistedModel, modelId: number): Promise<boolean> {

    type TModelInstance = IPersistedModelInstance & {User: () => IPersistedModelInstance}

    const model = await promisify<TModelInstance>(Model.find, Model)({
        where: { id: modelId },
        include: 'User'
    });

    if (!model) {
        return false;
    }

    const user = model.User();

    return user && user.id === userId;
}
