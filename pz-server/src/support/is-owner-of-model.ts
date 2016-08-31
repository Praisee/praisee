import promisify from 'pz-support/src/promisify';

export default async function isOwnerOfModel(
    userId: number, Model: IPersistedModel, modelId: number): Promise<boolean> {

    type TModelInstance = IPersistedModelInstance & { user: () => IPersistedModelInstance }

    const model = await promisify<TModelInstance>(Model.findById, Model)(modelId, {
        include: 'user'
    });

    if (!model) {
        return false;
    }

    const user = model.user();

    return user && user.id === userId;
}
