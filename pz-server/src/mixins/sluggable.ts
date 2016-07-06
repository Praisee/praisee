/**
 * Sluggables are any models that can have vanity URLs attached to them. For example,
 * a topic may be found at `praisee.com/Nikon-D800E`, where `Nikon-D800E` is the URL
 * slug.
 * 
 * This defines a mixin for the domain models to consume. In the server, this is
 * extended further with more server-specific domain logic.
 * 
 * See `pz-server/src/url-slugs/mixins/sluggable` for details.
 */

export interface ISluggableOptions {
    property: string
}

export interface ISluggable extends IPersistedModel {
    new (...properties: Array<any>): ISluggableInstance
    
    isSluggable: boolean
    sluggableProperty: string
    sluggableType: string
}

export interface ISluggableInstance extends IPersistedModelInstance {
    isSluggable: boolean
    sluggableProperty: string
    sluggableValue: string
    sluggableType: string
    sluggableId: number
}

function SluggableMixin(Model: ISluggable, options: ISluggableOptions) {
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
}

module.exports = SluggableMixin;
export default SluggableMixin;
