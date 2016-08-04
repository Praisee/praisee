import {ICursorResults} from 'pz-server/src/support/cursors/cursors';
import {IRepositoryRecord, createRecordFromLoopback} from 'pz-server/src/support/repository';

export function cursorLoopbackModelsToRecords<T extends IRepositoryRecord>(
    recordType: string, cursorResults: ICursorResults<IPersistedModelInstance>):
    ICursorResults<T> {

    return Object.assign({}, cursorResults, {
        results: cursorResults.results.map(result => {
            return {
                cursor: result.cursor,
                item: createRecordFromLoopback<T>(recordType, result.item)
            };
        })
    });
}
