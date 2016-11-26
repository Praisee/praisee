import {
    authorizer,
    TOptionalUser
} from 'pz-server/src/support/authorization';

import {ITopics, ITopic} from 'pz-server/src/topics/topics';
import {ICommunityItem} from 'pz-server/src/community-items/community-items';
import {TBiCursor, ICursorResults} from 'pz-server/src/support/cursors/cursors';
import {IPhoto} from 'pz-server/src/photos/photos';

export interface IAuthorizedTopics {
    findAll(): Promise<Array<ITopic>>
    findById(id: number): Promise<ITopic>
    findAllByIds(ids: Array<number>): Promise<Array<ITopic>>
    findByUrlSlugName(urlSlugName: string): Promise<ITopic>
    findSomeCommunityItemsRanked(topicId: number, cursor: TBiCursor): Promise<ICursorResults<ICommunityItem>>
    findSomePhotoGalleryPhotosRanked(topicId: number, cursor: TBiCursor): Promise<ICursorResults<IPhoto>>
    getCommunityItemCount(topicId: number): Promise<number>
    createAllByNames(topicNames: Array<string>): Promise<Array<ITopic>>
}

class AuthorizedTopics implements IAuthorizedTopics {
    private _user: TOptionalUser;
    private _topics: ITopics;

    constructor(user: TOptionalUser, topics: ITopics) {
        this._user = user;
        this._topics = topics;
    }

    findAll() {
        return this._topics.findAll();
    }

    findById(id: number) {
        return this._topics.findById(id);
    }

    findAllByIds(ids: Array<number>): Promise<Array<ITopic>> {
        return this._topics.findAllByIds(ids);
    }

    findByUrlSlugName(fullSlug: string) {
        return this._topics.findByUrlSlugName(fullSlug);
    }

    findSomeCommunityItemsRanked(topicId: number, cursor: TBiCursor) {
        return this._topics.findSomeCommunityItemsRanked(topicId, this._user, cursor);
    }

    findSomePhotoGalleryPhotosRanked(topicId: number, cursor: TBiCursor): Promise<ICursorResults<IPhoto>> {
        return this._topics.findSomePhotoGalleryPhotosRanked(topicId, this._user, cursor);
    }

    getCommunityItemCount(topicId: number): Promise<number>{
        return this._topics.getCommunityItemCount(topicId);
    }

    createAllByNames(topicNames: Array<string>): Promise<Array<number>> {
        if (topicNames.length > 5) {
            // TODO: This should be handled better, or at least returned instead of thrown
            throw new Error('Failing because user tried to create more than 5 topics');
        }

        return this._topics.createAllByNames(topicNames);
    }
}

export default authorizer<IAuthorizedTopics>(AuthorizedTopics);
