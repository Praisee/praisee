import {IDraftjs08Data} from 'pz-support/definitions/draftjs-data.d';
import {IPhotos} from 'pz-server/src/photos/photos';
import appInfo from 'pz-server/src/app/app-info';
import {getCommunityItemContentPhotoVariationsUrls as getPhotoVariationsUrls} from 'pz-server/src/photos/photo-variations';
import {IAttachment} from 'pz-client/src/editor/attachment-plugin/attachment';

const attachmentNamespace = 'praiseeAttachment';

// TODO: This needs better guards on type safety to ensure changes to the client
// TODO: don't result in injection attacks

export async function filterAttachments(
        content: IDraftjs08Data,
        filterer: (attachment: IAttachment) => Promise<IAttachment | null>
    ): Promise<IDraftjs08Data> {

    const isAttachmentBlock = (block) => {
        return block.data && block.data.type === attachmentNamespace;
    };

    const mapAttachments = async (block) => {
        if (!isAttachmentBlock(block)) {
            return block;
        }

        const filteredAttachment = await filterer(block.data);

        if (!filteredAttachment) {
            return null;
        }

        return Object.assign({}, block, {
            data: Object.assign({}, block.data, filteredAttachment)
        });
    };

    const blocks = await Promise.all(content.blocks.map(mapAttachments));
    const filteredBlocks = blocks.filter(block => block);

    return Object.assign({}, content, {
        blocks: filteredBlocks
    });
}

export async function cleanAttachmentData(content: IDraftjs08Data, photos: IPhotos): Promise<IDraftjs08Data> {
    return filterAttachments(content, async (attachment: IAttachment) => {
        const {id, attachmentType, caption} = attachment;

        if (attachmentType === 'Loading') {
            return null;
        }

        if (!id || !attachmentType) {
            throw new Error('Invalid attachment: id or attachmentType missing');
        }

        let additionalData;

        if (attachmentType === 'Photo') {
            additionalData = await getPhotoAttachmentData(photos, id);
        }

        return Object.assign({}, attachment, additionalData, {
            id: id,
            attachmentType: attachmentType,
            caption: caption ? caption.toString() : null
        });
    })
}

export async function getPhotoAttachmentData(photos: IPhotos, photoId: number) {
    const photo = await photos.findById(photoId);

    if (!photo) {
        throw new Error('Could not find photo by ID: ' + photoId);
    }

    return getPhotoVariationsUrls(photo.photoServerPath);
}
