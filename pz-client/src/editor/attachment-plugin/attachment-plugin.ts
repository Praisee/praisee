import ContentAttachment from 'pz-client/src/editor/attachment-plugin/content-attachment.component';
import insertAtomicDataBlock from 'pz-client/src/editor/editor-state/insert-atomic-data-block';

import {
    IAttachment,
    isLoadingAttachment
} from 'pz-client/src/editor/attachment-plugin/attachment';

import AttachmentLoader from 'pz-client/src/editor/attachment-plugin/attachment-loader.component';
import EditorState = Draft.Model.ImmutableData.EditorState;
import replaceBlockData from 'pz-client/src/editor/editor-state/replace-block-data';

const attachmentNamespace = 'praiseeAttachment';

export function createAttachmentPlugin() {
    return {
        blockRendererFn: (contentBlock): any => {
            const blockData = contentBlock.getData().toJS();

            if (!blockData || blockData.type !== attachmentNamespace) {
                return;
            }

            if (isLoadingAttachment(blockData)) {
                return {
                    component: AttachmentLoader,

                    props: {
                        attachmentPromise: blockData.attachmentPromise
                    }
                }
            } else {
                return {
                    component: ContentAttachment,

                    props: {
                        attachment: blockData
                    }
                };
            }
        },
    };
}

export function insertAttachmentLoader(editorState: EditorState, attachmentPromise: Promise<IAttachment>): [EditorState, Promise<EditorState>] {
    const [loadingState, blockKey] = insertAtomicDataBlock(editorState, {
        type: attachmentNamespace,
        attachmentType: 'Loading',
        attachmentPromise
    });

    return [
        loadingState,

        attachmentPromise.then(
            attachment => replaceBlockData(loadingState, blockKey, Object.assign({}, attachment, {
                type: attachmentNamespace,
            }))
        )
    ];
}

export function insertAttachment(editorState: EditorState, attachmentData: IAttachment): EditorState {
    const [newEditorState] = insertAtomicDataBlock(editorState, Object.assign({}, attachmentData, {
        type: attachmentNamespace
    }));

    return newEditorState;
}
