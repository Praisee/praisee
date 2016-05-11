import {ICommunityItemSearch, ICommunityItemSearchInstance} from 'pz-domain/src/search-models/community-item-search';
import promisify from 'pz-support/src/promisify';

export type TCommunityItemType = (
    'comment'
    | 'comparison'
    | 'howto'
    | 'question'
    | 'review'
);

export interface ICommunityItem extends IPersistedModel {
    type: TCommunityItemType
}

export interface ICommunityItemInstance extends IPersistedModelInstance {
    id: number
    summary: string,
    body: string
}

module.exports = function (CommunityItem: ICommunityItem) {
    CommunityItem.observe('after save', (context, next) => {
        // TODO: This should be done with a job queue in the future for better performance and fault tolerance
        
        const CommunityItemSearch = CommunityItem.app.models.CommunityItemSearch as ICommunityItemSearch;
        const communityItem = context.instance as ICommunityItemInstance;
        const Model = context.Model as ICommunityItem;
        
        const communityItemId = communityItem.id;
        const communityItemType = Model.type;
        
        const filter = {
            where: {
                communityItemId,
                type: communityItemType
            }
        };
        
        (promisify(CommunityItemSearch.findOne, CommunityItemSearch)(filter)

            .then((searchable: ICommunityItemSearchInstance) => {
                if (!searchable) {
                    searchable = new CommunityItemSearch() as ICommunityItemSearchInstance;
                }

                searchable.communityItemId = communityItemId;
                searchable.type = communityItemType;
                searchable.summary = communityItem.summary;
                searchable.body = communityItem.body;

                return promisify(searchable.save, searchable)();
            })

            .then(() => next(null))

            .catch((error) => {
                console.error('Failed to create search document:', error);
                next(null);
                
                throw error;
            })
        );
    });
};
