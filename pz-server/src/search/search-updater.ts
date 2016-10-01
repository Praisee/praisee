import promisify from 'pz-support/src/promisify';

import {
    ISearchUpdateJobInstance,
    ISearchUpdateJob,
    TOperation
} from 'pz-server/src/search/models/search-update-job';

import {ICommunityItemModel, ICommunityItemInstance} from 'pz-server/src/models/community-item';
import {ITopicInstance, ITopicModel} from 'pz-server/src/models/topic';
import SearchClient from 'pz-server/src/search/search-client';
import searchSchema from 'pz-server/src/search/schema';
import {IBulkUpsert, IDocumentPath, IBulkDelete} from './search';
import {IUrlSlugInstance, IUrlSlugModel} from 'pz-server/src/url-slugs/models/url-slug';
import routePaths from 'pz-server/src/vanity-route-paths/route-path-templates';

export interface ISearchUpdaterModels {
    SearchUpdateJob: ISearchUpdateJob
    CommunityItem: ICommunityItemModel
    Topic: ITopicModel
    UrlSlug: IUrlSlugModel
    [modelName: string]: IPersistedModel
}

// TODO: This is a hacked-in job queue that should be replaced with a real job queue
// TODO: This is only meant for demonstration and should not be relied on long-term

export default class SearchUpdater {
    public updateFrequency = 5; // TODO: Set this to something higher like 30 in production

    public searchClient: SearchClient;

    private _models: ISearchUpdaterModels;

    private _updateTimer;

    private _operationHooks = [];

    constructor(models: ISearchUpdaterModels, searchClient: SearchClient) {
        this._models = models;
        this.searchClient = searchClient;
    }

    start() {
        this.addSearchUpdateObservers();

        let isRunningStill = false;

        this._updateTimer = setInterval(() => {
            if (isRunningStill) {
                return;
            }

            this.runJobs().then(() => {
                isRunningStill = false;
            });

        }, this.updateFrequency * 1000);
    }

    stop() {
        clearInterval(this._updateTimer);
        this.removeSearchUpdateObservers();
    }

    async runJobs() {
        const {SearchUpdateJob} = this._models;

        const incompleteJobs = await SearchUpdateJob.findIncompleteJobs();

        if (!incompleteJobs.length) {
            return;
        }

        const bulkOperations = this._jobsToBulkOperations(incompleteJobs);

        await this.searchClient.performBulkOperations(bulkOperations);

        await SearchUpdateJob.markAsCompletedByIds(
            incompleteJobs.map(incompleteJob => incompleteJob.id)
        );
    }

    addSearchUpdateObservers() {
        this.removeSearchUpdateObservers();

        const saveHook = this._createHook('save');
        const destroyHook = this._createHook('destroy');

        this._addHook('CommunityItem', 'after save', saveHook);
        this._addHook('Topic', 'after save', saveHook);
        this._addHook('UrlSlug', 'after save', saveHook);

        this._addHook('CommunityItem', 'before delete', destroyHook);
        this._addHook('Topic', 'before delete', destroyHook);
    }

    removeSearchUpdateObservers() {
        this._operationHooks.forEach(({modelName, operationName, hook}) => {
            this._models[modelName].removeObserver(operationName, hook);
        });
    }

    private _addHook(modelName, operationName, hook) {
        this._models[modelName].observe(operationName, hook);
        this._operationHooks.push({modelName, operationName, hook});
    }

    private _createHook(operation: TOperation): (context) => Promise<void> {
        return async (context): Promise<void> => {
            const models = await this._extractModelsFromOperationHookContext(context);

            await Promise.all(models.map(({modelName, modelId}) => {
                return this._createSearchUpdateJob(modelName, modelId, operation);
            }));
        };
    }

    private async _extractModelsFromOperationHookContext(context): Promise<Array<IModelDefinition>> {
        const Model = context.Model;
        const modelName = Model.modelName;

        if (context.instance) {
            return [{
                modelName,
                modelId: context.instance.id
            }];

        } else if (context.where && context.where.id) {
            return [{
                modelName,
                modelId: context.where.id
            }];

        } else {
            const modelCount = await promisify(Model.count, Model)();

            if (modelCount > 100) {
                throw new Error('Too many ' + modelName + ' models to handle in operation ');
            }

            const models = await promisify(Model.find, Model)({
                where: context.where
            }) as Array<IPersistedModelInstance>;

            if (models.length < 0) {
                throw new Error('Cannot find ID for model' + modelName)
            }

            return models.map(model => ({
                modelName,
                modelId: model.id
            }));
        }
    }

    private async _createSearchUpdateJob(modelName: string, modelId: number, operation: TOperation): Promise<void> {
        const Model: IPersistedModel = this._models[modelName];

        let model;

        if (operation !== 'destroy') {
            model = await promisify(Model.findById, Model)(modelId);
        } else {
            model = new Model({id: modelId});
        }

        if (!model) {
            console.error('Unable to locate model',
                modelName, modelId);

            return;
        }

        if (model instanceof this._models.CommunityItem) {
            return this._createCommunityItemJob(operation, model);
        } else if (model instanceof this._models.Topic) {
            return this._createTopicJob(operation, model);
        } else if (model instanceof this._models.UrlSlug) {
            return this._createUrlSlugJob(operation, model);
        } else {
            console.error('Unable to handle model type', modelName);
        }
    }

    private _createCommunityItemJob(operation: TOperation, communityItem: ICommunityItemInstance) {
        const Model = communityItem.constructor as ICommunityItemModel;

        const path = {
            index: searchSchema.index,
            type: searchSchema.types.communityItem,
            id: communityItem.id
        };

        if (operation === 'save') {
            const document = {
                type: Model.type,
                summary: communityItem.summary,
                body: communityItem.body
            };

            return this._createSaveJob(path, document);

        } else if (operation === 'destroy') {
            return this._createDestroyJob(path);
        }
    }

    private _createTopicJob(operation: TOperation, topic: ITopicInstance) {
        const path = {
            index: searchSchema.index,
            type: searchSchema.types.topic,
            id: topic.id
        };

        if (operation === 'save') {
            if (!topic.isVerified) {
                return; // Only verified topics get added to search
            }

            const document = {
                name: topic.name,
                description: topic.description
            };

            return this._createSaveJob(path, document);

        } else if (operation === 'destroy') {
            return this._createDestroyJob(path);
        }
    }

    private _createUrlSlugJob(operation: TOperation, urlSlug: IUrlSlugInstance) {
        if (urlSlug.isAlias) {
            return;
        }

        if (operation !== 'save') {
            console.error('Unknown search update operation for URL slugs: ', operation);

            return;
        }

        const Model = this._models[urlSlug.sluggableType];
        let path, routePath;

        const pathFromType = (type) => ({
            index: searchSchema.index,
            type: searchSchema.types[type],
            id: urlSlug.sluggableId
        });

        switch (urlSlug.sluggableType) {
            case 'Topic':
                path = pathFromType('topic');
                routePath = routePaths.topic.index(urlSlug.fullSlug);
                break;

            case 'CommunityItem':
                path = pathFromType('communityItem');
                routePath = routePaths.communityItem(urlSlug.fullSlug);
                break;

            default:
                return;
        }

        return this._createSaveJob(path, {
            routePath: routePath
        });
    }

    private async _createSaveJob(path, document) {
        const {SearchUpdateJob} = this._models;

        const searchUpdateJob = SearchUpdateJob.from(
            path,
            'save',
            document
        );

        await promisify(searchUpdateJob.save, searchUpdateJob)();
    }

    private async _createDestroyJob(path) {
        const {SearchUpdateJob} = this._models;

        const searchUpdateJob = SearchUpdateJob.from(
            path,
            'destroy'
        );

        await promisify(searchUpdateJob.save, searchUpdateJob)();
    }

    private _jobsToBulkOperations(searchUpdateJobs: Array<ISearchUpdateJobInstance>):
        Array<IBulkUpsert | IBulkDelete> {

        return searchUpdateJobs.map(searchUpdateJob => {
            const path: IDocumentPath = {
                index: searchUpdateJob.pathIndex,
                type: searchUpdateJob.pathType,
                id: searchUpdateJob.pathId
            };

            if (searchUpdateJob.operation === 'save') {
                const upsertOperation: IBulkUpsert = {
                    type: 'upsert',
                    path,
                    document: searchUpdateJob.searchDocument
                };

                return upsertOperation;

            } else if (searchUpdateJob.operation === 'destroy') {
                const deleteOperation: IBulkDelete = {
                    type: 'delete',
                    path
                };

                return deleteOperation;

            } else {
                throw new Error('Unable to handle operation: ' + searchUpdateJob.operation)
            }
        });
    }
}

interface IModelDefinition {
    modelName: string
    modelId: number
}

