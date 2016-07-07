import promisify from 'pz-support/src/promisify';
import {ISearchUpdateJobInstance} from 'pz-server/src/search/models/search-update-job';
import {ICommunityItem, ICommunityItemInstance} from 'pz-server/src/models/community-item';
import {ITopicInstance} from 'pz-server/src/models/topic';
import SearchClient from 'pz-server/src/search/search-client';
import {findCommunityItemByKeys, findTopicByKey} from 'pz-server/src/search/queries';
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
        const destroyHook = this._createHook('destroy');
        
        this._models.CommunityItem.observe('after save', saveHook);
        this._models.Topic.observe('after save', saveHook);

        this._models.CommunityItem.observe('before delete', destroyHook);
        this._models.Topic.observe('before delete', destroyHook);
    }
    
    _createHook(operation: string) {
        return async (context) => {
            const Model = context.Model;
            const modelName = Model.modelName;

            if (context.instance) {
                return this._createSearchUpdateJob(
                    modelName,
                    context.instance.id,
                    operation
                );
                
            } else if (context.where && context.where.id) {
                return this._createSearchUpdateJob(
                    modelName,
                    context.where.id,
                    operation
                );
                
            } else {
                const modelCount = await promisify(Model.count, Model)();
                
                if (modelCount > 100) {
                    throw new Error('Too many ' + modelName + ' models to handle in operation ' + operation);
                }
                
                const models = await promisify(Model.find, Model)({
                    where: context.where
                }) as Array<IPersistedModelInstance>;
                
                if (models.length < 0) {
                    throw new Error('Cannot find ID for model' + modelName + ' in operation ' + operation)
                }
                
                return Promise.all(models.map(model => {
                    return this._createSearchUpdateJob(modelName, model.id, operation);
                }));
            }
        };
    }
    
    _createSearchUpdateJob(modelName, modelId, operation): Promise<any> {
        const searchUpdateJob = new this._models.SearchUpdateJob({
            modelName: modelName,
            modelId: modelId,
            operation: operation
        });

        try {
            return promisify(searchUpdateJob.save, searchUpdateJob)();

        } catch(error) {
            console.error('Failed to create search update job', error);
            return Promise.resolve();
        }
    }
    
    _handleJob(searchUpdateJob: ISearchUpdateJobInstance) {
        const Model = this._models[searchUpdateJob.modelName];

        if (!Model) {
            console.error('Unknown model type', searchUpdateJob.modelName);
            return;
        }
        
        (Promise.resolve()
            .then(() => {
                if (searchUpdateJob.operation !== 'destroy') {
                    return promisify(Model.findById, Model)(searchUpdateJob.modelId);
                } else {
                    return new Model({id: searchUpdateJob.modelId});
                }
            })
            
            .then((model): any => {
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
            
            .catch((error) => {
                console.error('Search updater job failed');
                
                if (error && error.stack) {
                    console.error(error.stack);
                } else {
                    console.error(error);
                }
                
                throw error;
            })
        );
    }
    
    _handleCommunityItemJob(searchUpdateJob: ISearchUpdateJobInstance, communityItem: ICommunityItemInstance) {
        const Model: ICommunityItem = this._models[searchUpdateJob.modelName];
        
        const path = {index: searchSchema.index, type: searchSchema.types.communityItem};
        const query = findCommunityItemByKeys(Model.type, communityItem.id);
        
        switch (searchUpdateJob.operation) {
            case 'save':
                const document = {
                    communityItemId: communityItem.id,
                    type: Model.type,
                    summary: communityItem.summary,
                    body: communityItem.body
                };
                
                return this._saveSearchDocument(path, query, document);
            
            case 'destroy':
                return this._destroySearchDocument(path, query);
        }
    }
    
    _handleTopicJob(searchUpdateJob: ISearchUpdateJobInstance, topic: ITopicInstance) {
        const path = {index: searchSchema.index, type: searchSchema.types.topic};
        const query = findTopicByKey(topic.id);
        
        switch (searchUpdateJob.operation) {
            case 'save':
                if (!topic.isVerified) {
                    return; // Only verified topics get added to search
                }
                
                const document = {
                    topicId: topic.id,
                    name: topic.name,
                    description: topic.description
                };
                
                return this._saveSearchDocument(path, query, document);

            case 'destroy':
                return this._destroySearchDocument(path, query);
        }
    }
    
    _saveSearchDocument(path, query, document) {
        return (this.searchClient.createOrUpdate(path, query, document)
                .catch((error) => {
                    console.error('Failed to create search document:', error);
                    throw error;
                })
        );
    }
    
    _destroySearchDocument(path, query) {
        return (this.searchClient.destroyDocumentByQuery(path, query)
            .catch((error) => {
                console.error('Failed to destroy search document:', error);
                throw error;
            })
        );
    }
    
    _markAsCompleted(searchUpdateJob) {
        searchUpdateJob.isCompleted = true;
        return promisify(searchUpdateJob.save, searchUpdateJob)();
    }
}
