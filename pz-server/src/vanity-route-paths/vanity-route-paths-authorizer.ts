import {
    authorizer,
    TOptionalUser
} from 'pz-server/src/support/authorization';

import {
    IVanityRoutePath,
    IVanityRoutePaths,
    TVanityRoutePathSupportedRecord,
    ITopicVanityRoutePath
} from 'pz-server/src/vanity-route-paths/vanity-route-paths';

import {ITopic} from 'pz-server/src/topics/topics';

export interface IAuthorizedVanityRoutePaths {
    findByRecord(record: TVanityRoutePathSupportedRecord): Promise<IVanityRoutePath>;
    findByTopic(record: ITopic): Promise<ITopicVanityRoutePath>
}

class AuthorizedVanityRoutePaths implements IAuthorizedVanityRoutePaths {
    private _user: TOptionalUser;
    private _vanityRoutePaths: IVanityRoutePaths;

    constructor(user: TOptionalUser, vanityRoutePaths: IVanityRoutePaths) {
        this._user = user;
        this._vanityRoutePaths = vanityRoutePaths;
    }

    findByRecord(record: TVanityRoutePathSupportedRecord): Promise<IVanityRoutePath> {
        return this._vanityRoutePaths.findByRecord(record);
    }

    findByTopic(record: ITopic): Promise<ITopicVanityRoutePath> {
        return this._vanityRoutePaths.findByTopic(record);
    }
}

export default authorizer<IAuthorizedVanityRoutePaths>(AuthorizedVanityRoutePaths);
