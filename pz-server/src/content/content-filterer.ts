import {
    IContentData,
    isDraftJs08Content,
    IDraftjs08Content
} from 'pz-server/src/content/content-data';

import {
    updateMentionData,
    cleanMentionData
} from 'pz-server/src/content/filters/mention-data';

import {IVanityRoutePaths} from 'pz-server/src/vanity-route-paths/vanity-route-paths';
import {ITopics} from 'pz-server/src/topics/topics';
import {ICommunityItems} from 'pz-server/src/community-items/community-items';

export interface IContentFilterer {
    filterBeforeRead(contentData: IContentData): Promise<IContentData>
    filterBeforeWrite(contentData: IContentData): Promise<IContentData>
}

export default class ContentFilterer implements IContentFilterer {
    private _routePaths: IVanityRoutePaths;
    private _topics: ITopics;
    private _communityItems: ICommunityItems;

    constructor(routePaths: IVanityRoutePaths, topics: ITopics, communityItems: ICommunityItems) {
        this._routePaths = routePaths;
        this._topics = topics;
        this._communityItems = communityItems;
    }

    async filterBeforeRead(contentData: IContentData): Promise<IContentData> {
        if (isDraftJs08Content(contentData)) {
            let filteredValue = contentData.value;

            filteredValue = await updateMentionData(
                filteredValue,
                this._routePaths,
                this._topics,
                this._communityItems
            );

            return Object.assign({}, contentData, {
                value: filteredValue
            });

        } else {

            return contentData;
        }
    }

    async filterBeforeWrite(contentData: IContentData): Promise<IContentData> {
        if (isDraftJs08Content(contentData)) {
            let filteredValue = contentData.value;

            filteredValue = cleanMentionData(filteredValue);

            return Object.assign({}, contentData, {
                value: filteredValue
            });

        } else {

            return contentData;
        }
    }
}
