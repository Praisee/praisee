/**
 * Sluggables are any models that can have vanity URLs attached to them. For example,
 * a topic may be found at `praisee.com/Nikon-D800E`, where `Nikon-D800E` is the URL
 * slug.
 */

import promisify from 'pz-support/src/promisify';

import {IUrlSlug, IUrlSlugInstance} from 'pz-server/src/url-slugs/models/url-slug';
import {ISluggerOptions} from 'pz-server/src/url-slugs/slugger';

export interface ISluggableOptions {
    property: string
}

export interface ISluggable extends IPersistedModel {
    new (...properties: Array<any>): ISluggableInstance

    isSluggable: boolean
    sluggableProperty: string
    sluggableType: string

    sluggerOptions?: ISluggerOptions
    getByUrlSlugName(fullSlug: string): Promise<ISluggableInstance>
}

export interface ISluggableInstance extends IPersistedModelInstance {
    isSluggable: boolean
    sluggableProperty: string
    sluggableValue: string
    sluggableType: string
    sluggableId: number

    UrlSlug: IUrlSlug

    getCanonicalUrlSlug(): Promise<IUrlSlugInstance>
    getCanonicalUrlSlugValue(): Promise<string>
}

export function disableRemoteMethodsForRelatedModel(Model: IModel, relatedModelName: string) {
    const methods = Model.sharedClass.methods({ includeDisabled: false });

    for (let method of methods) {
        if (method.name.startsWith('__') && method.name.endsWith(relatedModelName)) {
            Model.disableRemoteMethod(method.name, method.isStatic);
        }
    }
}

module.exports = function SluggableMixin(Model: ISluggable, options: ISluggableOptions) {
    Model.isSluggable = true;
    Model.prototype.isSluggable = true;

    Model.sluggableProperty = options.property;
    Model.prototype.sluggableProperty = options.property;

    Object.defineProperties(Model, {
        sluggableType: {
            get() {
                return this.modelName;
            }
        }
    });

    Object.defineProperties(Model.prototype, {
        sluggableValue: {
            get() {
                return this[this.sluggableProperty].toString();
            }
        },

        sluggableType: {
            get() {
                return this.constructor.modelName;
            }
        },

        sluggableId: {
            get() {
                return this.id;
            }
        }
    });

    Model.remoteMethod('getCanonicalUrlSlugValue', {
        isStatic: false,

        http: {
            verb: 'get',
            path: '/canonicalUrlSlug'
        },

        returns: {
            arg: 'urlSlug',
            type: 'string'
        }
    });

    Model.remoteMethod('getByUrlSlugName', {
        isStatic: true,

        accepts: {
            arg: 'urlSlug',
            type: 'string'
        },

        http: {
            verb: 'get',
            path: '/getByUrlSlugName/'
        },

        returns: {
            arg: 'sluggable',
            type: 'object'
        }
    });

    // TODO: Find a better hack
    // See https://github.com/strongloop/loopback-datasource-juggler/issues/969
    (promisify(Model.getApp, Model)()
        .then(() => {
            Model.hasMany('UrlSlug', {
                polymorphic: {
                    foreignKey: 'sluggableId',
                    discriminator: 'sluggableType'
                }
            });

            disableRemoteMethodsForRelatedModel(Model, 'UrlSlug');
        })
    );

    Model.observe('after save', async (context) => {
        const instance: ISluggableInstance = context.instance;

        if (!instance || !instance.isSluggable || context.hookState.__isSlugged) {
            return;
        }

        // Sometimes this fires multiple times because of model inheritance
        // (once for the model, and again for its parent). So we need to make
        // sure this doesn't create duplicate URL slugs.
        context.hookState = context.hookState || {};
        context.hookState.__isSlugged = true;

        const UrlSlug: IUrlSlug = Model.app.models.UrlSlug;

        try {
            if (context.isNewInstance) {
                await UrlSlug.createSlugForSluggable(instance);
            } else {
                await UrlSlug.updateSlugForSluggable(instance);
            }

        } catch (error) {
            // TODO: If this fails, it should be tried again on access
            console.error(`Failed to save URL slug for ${instance.sluggableValue}, continuing`);
            console.error(error.stack);
            // We'll try again when the slug is requested
        }
    });

    Model.prototype.getCanonicalUrlSlug = async function () {
        const urlSlugPromise = promisify(this.UrlSlug.findOne, this.UrlSlug)({
            isAlias: false
        }) as Promise<IUrlSlugInstance>;

        return urlSlugPromise;
    };

    Model.prototype.getCanonicalUrlSlugValue = async function () {
        const urlSlug = await this.getCanonicalUrlSlug();
        return urlSlug.fullSlug;
    };

    Model.getByUrlSlugName = async function (fullSlug) {
        const UrlSlug = Model.app.models.UrlSlug;
        
        let urlSlug: IUrlSlugInstance = await promisify(UrlSlug.findOne, UrlSlug)({
            where: {
                sluggableType: Model.sluggableType,
                fullSlugLowercase: fullSlug.toLowerCase()
            }
        }) as IUrlSlugInstance;
        
        return promisify(Model.findById, Model)(urlSlug.sluggableId);
    };
};
