export type TAttachmentType = 'Loading' | 'Photo'

export interface IAttachment {
    id: number
    attachmentType: TAttachmentType
    caption?: string
}

export interface ILoadingAttachment extends IAttachment {
    attachmentType: 'Loading'
    loadingAttachmentType: TAttachmentType
    attachmentPromise: Promise<IAttachment>
}

export function isLoadingAttachment(attachment: IAttachment): attachment is ILoadingAttachment {
    return attachment.attachmentType === 'Loading';
}

export interface IPhotoAttachment extends IAttachment {
    attachmentType: 'Photo'

    defaultUrl: string

    variationUrls?: {
        [variation: string]: string
    }
}

export function isPhotoAttachment(attachment: IAttachment): attachment is IPhotoAttachment {
    return attachment.attachmentType === 'Photo';
}
