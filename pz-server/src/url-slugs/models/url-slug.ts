/**
 * URL slugs are used for creating vanity URLs such as `praisee.com/Nikon-D800E`.
 * Certain models may be attached to URL slugs that add up to create a vanity URL.
 * 
 * The logic under here defines the creation and update of URL slugs as well as
 * collision considerations and aliasing.
 */

import promisify from 'pz-support/src/promisify';
import {
    ISluggableInstance,
    ISluggable
} from 'pz-server/src/url-slugs/mixins/sluggable';
import createSlug from 'pz-server/src/url-slugs/slugger';

export interface IUrlSlug extends IPersistedModel {
    daysBeforeAliasCanBeCreated: number
    maxAliases: number;
    
    createSlugForSluggable(sluggable: ISluggableInstance): Promise<any>
    updateSlugForSluggable(sluggable: ISluggableInstance): Promise<any>

    getSlugForSluggableQuery(sluggableType: string, sluggableId: number): IFinderFilter
    
    _generateFullSlug(sluggable: ISluggableInstance, duplicateOffset: number): string
    _generateBaseSlug(sluggable: ISluggableInstance): string

    _getAliasesForSluggableQuery(sluggableType: string, sluggableId: number): IFinderFilter
    _getLastDuplicateUrlSlugQuery(baseSlug: string, sluggableType: string): IFinderFilter
}

export interface IUrlSlugInstance extends IPersistedModelInstance {
    fullSlug: string
    baseSlug: string
    duplicateOffset: number
    isAlias: boolean
    sluggableId: number
    sluggableType: string
    
    _convertSlugToAlias(): Promise<any>
    _getAliasCount(): Promise<any>
    _pruneOldAliases(): Promise<any>
}

module.exports = function (UrlSlug: IUrlSlug) {
    UrlSlug.daysBeforeAliasCanBeCreated = 3;
    UrlSlug.maxAliases = 2;
    
    UrlSlug.createSlugForSluggable = async function (sluggable: ISluggableInstance) {
        const baseSlug = UrlSlug._generateBaseSlug(sluggable);

        let duplicateOffset = 0;
        let fullSlug = baseSlug;
        
        const query = UrlSlug._getLastDuplicateUrlSlugQuery(baseSlug, sluggable.sluggableType);
        const existingSlug = await promisify(UrlSlug.findOne, UrlSlug)(query) as IUrlSlugInstance;
        
        if (existingSlug) {
            duplicateOffset = existingSlug.duplicateOffset + 1;
            fullSlug = UrlSlug._generateFullSlug(sluggable, duplicateOffset);
        }
        
        const newUrlSlug = {
            fullSlug,
            baseSlug,
            duplicateOffset,
            isAlias: false
        };

        return promisify(sluggable.UrlSlug.create, sluggable.UrlSlug)(newUrlSlug);
    };
    
    UrlSlug.updateSlugForSluggable = async function (sluggable: ISluggableInstance) {
        const query = UrlSlug.getSlugForSluggableQuery(
            sluggable.sluggableType,
            sluggable.sluggableId
        );
        
        let slugs = await(promisify(UrlSlug.find, UrlSlug)(query)) as Array<IUrlSlugInstance>;
        slugs = slugs || [];
        
        const baseSlug = UrlSlug._generateBaseSlug(sluggable);
        const currentSlug = slugs.find(slug => !slug.isAlias);
        const duplicateSlug = slugs.find(slug => slug.baseSlug === baseSlug);
        
        if (duplicateSlug) {
            if (duplicateSlug.isAlias) {
                currentSlug.isAlias = true;
                duplicateSlug.isAlias = false;
                
                if (currentSlug) {
                    return Promise.all([
                        promisify(currentSlug.save, currentSlug)(),
                        promisify(duplicateSlug.save, duplicateSlug)(),
                    ]);
                } else {
                    console.warn(
                        'Sluggable did not already have a primary URL slug. This could be due to a bug.',
                        sluggable.sluggableType, sluggable.sluggableId
                    );
                    
                    return promisify(duplicateSlug.save, duplicateSlug)();
                }
                
            } else {
                return; // Nothing to do
            }
        }
        
        if (!currentSlug) {
            console.warn(
                'Sluggable did not already have a primary URL slug. This could be due to a bug.',
                sluggable.sluggableType, sluggable.sluggableId
            );

            return UrlSlug.createSlugForSluggable(sluggable);
        }

        return await Promise.all([
            currentSlug._convertSlugToAlias(),
            UrlSlug.createSlugForSluggable(sluggable)
        ]);
    };

    UrlSlug.getSlugForSluggableQuery = function (sluggableType: string, sluggableId: number) {
        return {
            where: {sluggableType, sluggableId}
        };
    };
    
    UrlSlug._generateFullSlug = function (sluggable: ISluggableInstance, duplicateOffset: number) {
        const Sluggable = sluggable.constructor as ISluggable;
        
        const sluggerOptions = Object.assign(
            {}, Sluggable.sluggerOptions, {duplicateOffset}
        );
        
        return createSlug(sluggable.sluggableValue, sluggerOptions);
    };
    
    UrlSlug._generateBaseSlug = function (sluggable: ISluggableInstance) {
        const Sluggable = sluggable.constructor as ISluggable;
        const sluggerOptions = Sluggable.sluggerOptions;
        
        return createSlug(sluggable.sluggableValue, sluggerOptions);
    };
    
    UrlSlug._getAliasesForSluggableQuery = function (sluggableType: string, sluggableId: number) {
        return {
            where: {isAlias: true, sluggableType, sluggableId}
        };
    };

    UrlSlug._getLastDuplicateUrlSlugQuery = function (baseSlug: string, sluggableType: string) {
        return {
            where: {baseSlug, sluggableType},
            order: 'duplicateOffset DESC',
            limit: 1
        }
    };
    
    UrlSlug.prototype._convertSlugToAlias = async function () {
        const now = new Date();
        
        let dateWhenAliasCanBeCreated = new Date(this.createdAt);
        
        dateWhenAliasCanBeCreated.setDate(
            dateWhenAliasCanBeCreated.getDate() + UrlSlug.daysBeforeAliasCanBeCreated
        );
        
        if (now >= dateWhenAliasCanBeCreated) {
            this._pruneOldAliases();
            
            this.isAlias = true;
            return promisify(this.save, this)();
            
        } else {
            return promisify(this.destroy, this)();
        }
    };
    
    UrlSlug.prototype._getAliasCount = async function () {
        const aliasesQuery = UrlSlug._getAliasesForSluggableQuery(
            this.sluggableType,
            this.sluggableId
        );
        
        return promisify(UrlSlug.count, UrlSlug)(aliasesQuery.where);
    };
    
    UrlSlug.prototype._pruneOldAliases = async function () {
        if (UrlSlug.maxAliases < 1) {
            return;
        }
        
        const aliasesQuery = Object.assign({}, UrlSlug._getAliasesForSluggableQuery(
            this.sluggableType,
            this.sluggableId
        ), {order: 'createdAt DESC'});
        
        const aliases = await promisify(UrlSlug.find, UrlSlug)(aliasesQuery) as Array<IUrlSlugInstance>;
        
        if (aliases.length < UrlSlug.maxAliases) {
            return;
        }

        const aliasesToPrune = aliases
            .slice(UrlSlug.maxAliases - 1)
            .map(alias => alias.id);
        
        return promisify(UrlSlug.destroyAll, UrlSlug)({
            id: { inq: aliasesToPrune }
        });
    };
};
