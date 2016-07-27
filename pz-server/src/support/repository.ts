export interface IRepository {
}

export interface IRepositoryRecord {
    recordType: string
}

export function createRecord<T extends IRepositoryRecord>(recordType: string, data = {}): T {
    const record = Object.assign({}, data, {
        recordType: recordType
    }) as T;

    return record;
}

export function createRecordFromLoopback<T extends IRepositoryRecord>(recordType: string, data: IPersistedModelInstance): T {
    return createRecord<T>(recordType, data.__data);
}
