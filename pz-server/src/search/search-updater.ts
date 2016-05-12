import promisify from 'pz-support/src/promisify';
import {ISearchUpdateJobInstance} from 'pz-server/src/search/models/search-update-job';
import {ICommunityItem, ICommunityItemInstance} from 'pz-domain/src/models/community-item';
import SearchClient from 'pz-server/src/search/search-client';
import {findCommunityItemByKeys} from 'pz-server/src/search/queries';
import searchSchema from 'pz-server/src/search/schema';

// TODO: This is a hacked-in job queue that should be replaced with a real job queue
// TODO: This is only meant for demonstration and should not be relied on long-term

export default class SearchUpdater {
    public updateFrequency = 5; // TODO: Set this to something higher like 30 in production
    
    public searchClient: SearchClient;

    private _models;

    constructor(models: any, searchClient: SearchClient) {
        this._models = models;
        this.searchClient = searchClient;
    }

    start() {
        this._addHooks();
        
        setInterval(() => {
            this.runJobs();
        }, this.updateFrequency * 1000);
    }

    runJobs() {
        const filter = {
            where: {
                isCompleted: false
            }
        };
        
        return (promisify(this._models.SearchUpdateJob.find, this._models.SearchUpdateJob)(filter)
            .then((searchUpdateJobs: Array<ISearchUpdateJobInstance>) => {
                const updatePromises = searchUpdateJobs.map(searchUpdateJob => {
                    return this._handleJob(searchUpdateJob);
                });
                
                return Promise.all(updatePromises)
            })
        );
    }

    _addHooks() {
        const saveHook = this._createHook('save');
        const destroyHook = this._createHook('save');
        
        this._models.CommunityItem.observe('after save', saveHook);
        this._models.Topic.observe('after save', saveHook);

        this._models.CommunityItem.observe('after destroy', destroyHook);
        this._models.Topic.observe('after destroy', destroyHook);
    }
    
    _createHook(operation: string) {
        return (context, next) => {
            const searchUpdateJob = new this._models.SearchUpdateJob({
                modelName: context.Model.modelName,
                modelId: context.instance.id,
                operation: operation
            });
            
            (promisify(searchUpdateJob.save, searchUpdateJob)()
                .then(() => next(null))
                    
                .catch((error) => {
                    console.error('Failed to create search update job', error);
                    next(null);
                    throw error;
                })
            );
        };
    }
    
    _handleJob(searchUpdateJob: ISearchUpdateJobInstance) {
        const Model = this._models[searchUpdateJob.modelName];
        
        if (!Model) {
            console.error('Unknown model type', searchUpdateJob.modelName);
            return;
        }
        
        (promisify(Model.findById, Model)(searchUpdateJob.modelId)
            .then((model) => {
                if (!model) {
                    console.error('Unable to locate model',
                        searchUpdateJob.modelName, searchUpdateJob.modelId);
                    
                    return;
                }

                if (model instanceof this._models.CommunityItem) {
                    return this._handleCommunityItemJob(searchUpdateJob, model as ICommunityItemInstance);
                } else if (model instanceof this._models.Topic) {
                    return this._handleTopicJob(searchUpdateJob, model);
                } else {
                    console.error('Unable to handle model type', searchUpdateJob.modelName);
                }
            })
                
            .then(() => this._markAsCompleted(searchUpdateJob))
        );
    }
    
    _handleCommunityItemJob(searchUpdateJob: ISearchUpdateJobInstance, communityItem: ICommunityItemInstance) {
        const Model: ICommunityItem = this._models[searchUpdateJob.modelName];
        
        switch (searchUpdateJob.operation) {
            case 'save':
                let path = {index: searchSchema.index, type: searchSchema.types.communityItem};
                
                let query = findCommunityItemByKeys(Model.type, communityItem.id);
                
                let document = {
                    communityItemId: communityItem.id,
                    type: Model.type,
                    summary: communityItem.summary,
                    body: communityItem.body
                };
                
                return (this.searchClient.createOrUpdate(path, query, document)
                    .then(() => {
                    })
                        
                    .catch((error) => {
                        console.error('Failed to create search document:', error);
                        throw error;
                    })
                );
            
            case 'destroy':
                return;
        }
    }
    
    _handleTopicJob(searchUpdateJob: ISearchUpdateJobInstance, model: IModelInstance) {
        switch (searchUpdateJob.operation) {
            case 'save':
                break;

            case 'destroy':
                break;
        }
    }
    
    _markAsCompleted(searchUpdateJob) {
        searchUpdateJob.isCompleted = true;
        return promisify(searchUpdateJob.save, searchUpdateJob)();
    }
}
