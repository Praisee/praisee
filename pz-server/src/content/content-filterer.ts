import {
    IContentData,
    isDraftJs08Content,
    IDraftjs08Content
} from 'pz-server/src/content/content-data';

import {
    updateMentionData,
    cleanMentionData
} from 'pz-server/src/content/filters/mention-data';

import {cleanAttachmentData} from 'pz-server/src/content/filters/attachment-data';

import {IVanityRoutePaths} from 'pz-server/src/vanity-route-paths/vanity-route-paths';
import {ITopics} from 'pz-server/src/topics/topics';
import {ICommunityItems} from 'pz-server/src/community-items/community-items';
import {IPhotos} from 'pz-server/src/photos/photos';

export interface IContentFilterer {
    filterBeforeRead(contentData: IContentData): Promise<IContentData>
    filterBeforeWrite(contentData: IContentData): Promise<IContentData>
}

export default class ContentFilterer implements IContentFilterer {
    private _routePaths: IVanityRoutePaths;
    private _topics: ITopics;
    private _communityItems: ICommunityItems;
    private _photos: IPhotos;

    constructor(routePaths: IVanityRoutePaths, topics: ITopics, communityItems: ICommunityItems, photos: IPhotos) {
        this._routePaths = routePaths;
        this._topics = topics;
        this._communityItems = communityItems;
        this._photos = photos;
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

            filteredValue = await cleanAttachmentData(
                filteredValue,
                this._photos
            );

            return Object.assign({}, contentData, {
                value: filteredValue
            });

        } else {

            return contentData;
        }
    }
}
