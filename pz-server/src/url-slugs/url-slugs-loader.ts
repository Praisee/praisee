import {IUrlSlug, IUrlSlugs, ISluggable} from 'pz-server/src/url-slugs/url-slugs';

import DataLoader from 'dataloader';
import createDataLoaderBatcher from 'pz-server/src/support/create-dataloader-batcher';

export default class UrlSlugsLoader implements IUrlSlugs {
    private _urlSlugs: IUrlSlugs;

    private _loaders: {
        findAllForEachSluggable: DataLoader<ISluggable, IUrlSlug>
    };

    constructor(urlSlugs: IUrlSlugs) {
        this._urlSlugs = urlSlugs;

        this._loaders = {
            findAllForEachSluggable: createDataLoaderBatcher(
                this._urlSlugs.findAllForEachSluggable.bind(this._urlSlugs)
            )
        }
    }

    findAllBySluggable(sluggable: ISluggable): Promise<Array<IUrlSlug>> {
        return this._loaders.findAllForEachSluggable.load(sluggable);
    }

    findAllForEachSluggable(sluggables: Array<ISluggable>): Promise<Array<Array<IUrlSlug>>> {
        return this._loaders.findAllForEachSluggable.loadMany(sluggables);
    }
}
