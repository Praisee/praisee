import {
    authorizer,
    TOptionalUser
} from 'pz-server/src/support/authorization';

import {
    IVanityRoutePath,
    IVanityRoutePaths,
    TVanityRoutePathSupportedRecord
} from 'pz-server/src/vanity-route-paths/vanity-route-paths';

export interface IAuthorizedVanityRoutePaths {
    findByRecord(record: TVanityRoutePathSupportedRecord): Promise<IVanityRoutePath>;
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
}

export default authorizer<IAuthorizedVanityRoutePaths>(AuthorizedVanityRoutePaths);
