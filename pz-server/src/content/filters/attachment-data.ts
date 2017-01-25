import {IDraftjs08Data} from 'pz-support/definitions/draftjs-data.d';
import {IPhotos} from 'pz-server/src/photos/photos';

import {getCommunityItemContentPhotoVariationsUrls as getPhotoVariationsUrls} from 'pz-server/src/photos/photo-variations';

import {
    IAttachment,
    isPhotoAttachment, IYoutubeAttachment, isYoutubeAttachment, IPhotoAttachment
} from 'pz-client/src/editor/attachment-plugin/attachment';

const attachmentNamespace = 'praiseeAttachment';

// TODO: This needs better guards on type safety to ensure changes to the client
// TODO: don't result in injection attacks

function isAttachmentBlock(block) {
    return block.data && block.data.type === attachmentNamespace;
}

export async function filterAttachments(
        content: IDraftjs08Data,
        filterer: (attachment: IAttachment) => Promise<IAttachment | null>
    ): Promise<IDraftjs08Data> {

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

export function extractAttachments(content: IDraftjs08Data): Array<IAttachment> {
    return content.blocks.reduce<Array<IAttachment>>((attachments, block) => {
        if (!isAttachmentBlock(block)) {
            return attachments;
        }

        const attachment = block.data as IAttachment;

        return attachments.concat(attachment);

    }, []);
}

export function extractPhotoAttachments(content: IDraftjs08Data): Array<IPhotoAttachment> {
    const attachments = extractAttachments(content);
    return attachments.filter(attachment => isPhotoAttachment(attachment)) as Array<IPhotoAttachment>;
}

export async function cleanAttachmentData(content: IDraftjs08Data, photos: IPhotos): Promise<IDraftjs08Data> {
    return filterAttachments(content, async (attachment: IAttachment) => {
        const {attachmentType, caption} = attachment;

        if (attachmentType === 'Loading') {
            return null;
        }

        if (!attachmentType) {
            throw new Error('Invalid attachment: attachmentType missing');
        }

        let additionalData;

        if (isPhotoAttachment(attachment)) {
            const photoId = attachment.id;

            if (!attachmentType) {
                throw new Error('Invalid photo attachment: id missing');
            }

            additionalData = await getPhotoAttachmentData(photos, photoId);

        } else if (isYoutubeAttachment(attachment)) {
            additionalData = cleanYoutubeAttachmentData(attachment);
        }

        return Object.assign({}, attachment, additionalData, {
            attachmentType: attachmentType,
            caption: caption ? caption.toString() : null
        });
    })
}

async function getPhotoAttachmentData(photos: IPhotos, photoId: number) {
    const photo = await photos.findById(photoId);

    if (!photo) {
        throw new Error('Could not find photo by ID: ' + photoId);
    }

    return getPhotoVariationsUrls(photo.photoServerPath);
}

function cleanYoutubeAttachmentData(attachment: IYoutubeAttachment) {
    const videoId = attachment.videoId;

    if (!/[a-zA-Z0-9_-]/.test(videoId)) {
        throw new Error('Not a valid YouTube video ID: ' + videoId);
    }

    return {};
}
