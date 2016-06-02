/**
 * Sluggables are any models that can have vanity URLs attached to them. For example,
 * a topic may be found at `praisee.com/Nikon-D800E`, where `Nikon-D800E` is the URL
 * slug.
 *
 * This extends the base Sluggable mixin defined under
 * `pz-domain/src/mixins/sluggable` to implement additional server hooks and
 * server-specific domain logic that's better to keep under here for security
 * purposes.
 */

import promisify from 'pz-support/src/promisify';

import {
    default as ParentSluggableMixin,
    ISluggableOptions,
    ISluggable as IParentSluggable,
    ISluggableInstance as IParentSluggableInstance
} from 'pz-domain/src/mixins/sluggable';

import {IUrlSlug} from 'pz-server/src/url-slugs/models/url-slug';
import {ISluggerOptions} from 'pz-server/src/url-slugs/slugger';

export interface ISluggable extends IParentSluggable {
    sluggerOptions?: ISluggerOptions
}

export interface ISluggableInstance extends IParentSluggableInstance {
    UrlSlug: IUrlSlug
}

module.exports = function SluggableMixin(Model: ISluggable, options: ISluggableOptions) {
    ParentSluggableMixin(Model, options);

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
            
        } catch(error) {
            // TODO: If this fails, it should be tried again on access
            console.error(`Failed to save URL slug for ${instance.sluggableValue}, continuing`);
            console.error(error.stack);
            // We'll try again when the slug is requested
        }
    });
};
