import {convertFromRaw} from 'draft-js';
import {
    IContentData, isDraftJs08Content,
    isTextContent
} from 'pz-server/src/content/content-data';

export default function convertDataToText(contentStateData: IContentData) {
    if (isTextContent(contentStateData)) {
        return contentStateData.value;
    }

    if (isDraftJs08Content(contentStateData)) {
        const contentState = convertFromRaw(contentStateData.value);
        return contentState.getPlainText("\n");
    }

    throw new Error('Unable to convert content data');
}
