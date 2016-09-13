declare module 'dataloader' {
    export default class DataLoader<TKey, TValue> {
        constructor(batchLoadFn: IBatchLoaderFn<TKey, TValue>, options?: IDataLoaderOptions<TKey, TValue>)
        load(key: TKey): Promise<TValue>
        loadMany(keys: Array<TKey>): Promise<Array<TValue>>
        clear(key: TKey): void
        clearAll(): void
        prime(key: TKey, value: TValue): void
    }

    interface IBatchLoaderFn<TKey, TValue> {
        (keys: Array<TKey>): Promise<Array<TValue>>
    }

    interface IDataLoaderOptions<TKey, TValue> {
        batch?: boolean
        cache?: boolean
        cacheKeyFn?: Function
        cacheMap?: Map<TKey, TValue>
    }
}
