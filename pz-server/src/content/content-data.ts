export interface IContentData {
    type: string,
    version: string,
    value: any
}

export function isValidContentData(contentData: any): contentData is IContentData {
    return (
        typeof contentData.type === 'string'
        && typeof contentData.version === 'string'
        && contentData.value
    );
}

export interface ITextContent extends IContentData {
    type: 'text',
    version: '0',
    value: string
}

export function isTextContent(content: IContentData): content is ITextContent {
    return content.type === 'text';
}

export interface IDraftJs08Content extends IContentData {
    type: 'draftjs',
    version: '0.8.0'
}

export function isDraftJs08Content(content: IContentData): content is IDraftJs08Content {
    return content.type === 'draftjs' && content.version.startsWith('0.8');
}

export interface IDataToTextConverter {
    (data: IContentData): string
}
