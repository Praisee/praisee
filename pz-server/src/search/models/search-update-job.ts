import promisify from 'pz-support/src/promisify';
import {IDocumentPath} from 'pz-server/src/search/search';

export type TOperation = 'save' | 'destroy';

export interface ISearchUpdateJob extends IPersistedModel {
    new (...properties: Array<any>): ISearchUpdateJobInstance
    
    from(
        path: IDocumentPath, operation: TOperation, searchDocument?: any
    ): ISearchUpdateJobInstance
    
    findIncompleteJobs(): Promise<Array<ISearchUpdateJobInstance>>
    
    markAsCompletedByIds(ids: Array<number>): Promise<void>
}

export interface ISearchUpdateJobInstance extends IPersistedModelInstance {
    pathIndex: string
    pathType: string
    pathId: number
    operation: string
    searchDocument?: any
    
    markAsCompleted(): Promise<void>;
}

module.exports = function (SearchUpdateJob: ISearchUpdateJob) {
    SearchUpdateJob.from = function (
        path: IDocumentPath, operation: TOperation,
        searchDocument?: any) {
        
        return new SearchUpdateJob({
            pathIndex: path.index,
            pathType: path.type,
            pathId: path.id,
            operation,
            searchDocument: searchDocument || null
        });
    };
    
    SearchUpdateJob.findIncompleteJobs = async function () {
        const filter = {
            where: {
                isCompleted: false
            }
        };
        
        const incompleteJobs = await promisify(
            SearchUpdateJob.find, SearchUpdateJob
        )(filter) as Array<ISearchUpdateJobInstance>;
        
        return incompleteJobs;
    };
    
    SearchUpdateJob.markAsCompletedByIds = async function (ids: Array<number>) {
        const where = {
            ids: { inq: ids }
        };
        
        const data = {
            isCompleted: true
        };
        
        await promisify(SearchUpdateJob.updateAll, SearchUpdateJob)(
            where, data
        );
    };
    
    SearchUpdateJob.prototype.markAsCompleted = function () {
        this.isCompleted = true;
        return promisify(this.save, this)();
    };
};
