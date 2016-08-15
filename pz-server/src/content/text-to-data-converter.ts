import {ITextContent} from 'pz-server/src/content/content-data';

export default function convertTextToData(text: string): ITextContent {
    return {
        type: 'text',
        version: '0',
        value: text.toString()
    };
}
