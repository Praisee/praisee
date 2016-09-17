import {IDraftjs08Data} from 'pz-support/definitions/draftjs-data.d';
import {IPhotos} from 'pz-server/src/photos/photos';
import appInfo from 'pz-server/src/app/app-info';
import {getPhotoVariationsUrls} from 'pz-server/src/photos/photo-variations';

const attachmentNamespace = 'praiseeAttachment';

// TODO: This needs better guards on type safety to ensure changes to the client
// TODO: don't result in injection attacks

export async function cleanAttachmentData(content: IDraftjs08Data, photos: IPhotos): Promise<IDraftjs08Data> {
    const isAttachmentBlock = (block) => {
        return block.data && block.data.type === attachmentNamespace;
    };

    const filterLoadingAttachments = (block) => {
        return !isAttachmentBlock(block) || block.data.attachmentType !== 'Loading';
    };

    const cleanBlock = async (block) => {
        if (!isAttachmentBlock(block)) {
            return block;
        }

        const {id, attachmentType, caption} = block.data;

        if (!id || !attachmentType) {
            throw new Error('Invalid attachment: id or attachmentType missing');
        }

        let additionalData;

        if (attachmentType === 'Photo') {
            additionalData = await getPhotoAttachmentData(photos, id);
        }

        return Object.assign({}, block, additionalData, {
            id: id,
            attachmentType: attachmentType,
            caption: caption ? caption.toString() : null
        });
    };

    return Object.assign({}, content, {
        blocks: await Promise.all(
            content.blocks.filter(filterLoadingAttachments).map(cleanBlock)
        )
    });
}

export async function getPhotoAttachmentData(photos: IPhotos, photoId: number) {
    const photo = await photos.findById(photoId);

    if (!photo) {
        throw new Error('Could not find photo by ID: ' + photoId);
    }

    return getPhotoVariationsUrls(photo.photoServerPath);
}
