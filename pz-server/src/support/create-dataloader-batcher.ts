import DataLoader from 'dataloader';

export default function createDataLoaderBatcher<TId, TResult>(
    manyLoader: (ids: Array<TId>) => Promise<Array<TResult>>,
    options: any = {cache: false}
): DataLoader<TId, TResult> {

    return new DataLoader(async (ids: Array<TId>) => {
        return await manyLoader(ids);
    }, options);
}
