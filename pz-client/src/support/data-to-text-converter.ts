import {convertFromRaw} from 'draft-js';
import {
    IContentData, isDraftJs08Content,
    isTextContent
} from 'pz-server/src/content/content-data';

// TODO: This is a duplicate of pz-server/src/content/data-to-text-converter and needs to be removed
// TODO: Duplicated due to build issue under pz-server not building the codem correctly for pz-client

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
