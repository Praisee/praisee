import {
    authorizer,
    TOptionalUser
} from 'pz-server/src/support/authorization';

import {ITopics, ITopic} from 'pz-server/src/topics/topics';
import {ICommunityItem} from 'pz-server/src/community-items/community-items';

export interface IAuthorizedTopics {
    findAll(): Promise<Array<ITopic>>
    findById(id: number): Promise<ITopic>
    findByUrlSlugName(urlSlugName: string): Promise<ITopic>
    findAllCommunityItemsRanked(topicId: number): Promise<Array<ICommunityItem>>
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

    findByUrlSlugName(fullSlug: string){
        return this._topics.findByUrlSlugName(fullSlug);
    }

    findAllCommunityItemsRanked(topicId: number){
        return this._topics.findAllCommunityItemsRanked(topicId);
    }
}

export default authorizer<IAuthorizedTopics>(AuthorizedTopics);
