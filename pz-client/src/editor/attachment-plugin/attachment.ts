export type TAttachmentType = 'Loading' | 'Photo' | 'Youtube'

export interface IAttachment {
    attachmentType: TAttachmentType
    caption?: string
    [data: string]: any
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

    id: number

    defaultUrl: string

    variationUrls?: {
        [variation: string]: string
    }
}

export function isPhotoAttachment(attachment: IAttachment): attachment is IPhotoAttachment {
    return attachment.attachmentType === 'Photo';
}

export interface IYoutubeAttachment extends IAttachment {
    attachmentType: 'Youtube'

    videoId: string
}

export function isYoutubeAttachment(attachment: IAttachment): attachment is IYoutubeAttachment {
    return attachment.attachmentType === 'Youtube';
}
